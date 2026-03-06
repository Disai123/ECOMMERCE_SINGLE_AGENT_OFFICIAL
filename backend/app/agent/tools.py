import json
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import or_
from .. import models


class AgentTools:
    def __init__(self, db: AsyncSession, user_id: int, session_id: str):
        self.db = db
        self.user_id = user_id
        self.session_id = session_id

    async def search_products(self, query: str):
        """Search for products by name or description."""
        stmt = select(models.Product).filter(
            or_(
                models.Product.name.ilike(f"%{query}%"),
                models.Product.description.ilike(f"%{query}%")
            )
        ).limit(5)
        result = await self.db.execute(stmt)
        products = result.scalars().all()
        return [
            {
                "id": p.id,
                "name": p.name,
                "price": float(p.price),
                "stock": p.stock_quantity,
                "description": p.description,
                "image_url": p.image_url
            }
            for p in products
        ]

    async def get_cart(self):
        """Get the current items in the cart."""
        stmt = select(models.AgentSession).filter(
            models.AgentSession.id == self.session_id
        )
        result = await self.db.execute(stmt)
        session = result.scalars().first()
        if not session or not session.cart_state:
            return []
        return json.loads(session.cart_state)

    async def add_to_cart(self, product_id: int, quantity: int = 1):
        """Add a product to the cart."""
        # Check product validity
        stmt = select(models.Product).filter(models.Product.id == product_id)
        result = await self.db.execute(stmt)
        product = result.scalars().first()
        if not product:
            return "Product not found."

        # Get current session/cart
        stmt_sess = select(models.AgentSession).filter(
            models.AgentSession.id == self.session_id
        )
        res_sess = await self.db.execute(stmt_sess)
        session = res_sess.scalars().first()

        cart = []
        if session and session.cart_state:
            cart = json.loads(session.cart_state)

        # Update cart
        found = False
        for item in cart:
            if item["product_id"] == product_id:
                item["quantity"] += quantity
                found = True
                break
        if not found:
            cart.append({
                "product_id": product_id,
                "name": product.name,
                "price": float(product.price),
                "quantity": quantity
            })

        session.cart_state = json.dumps(cart)

        # flush() writes to DB but keeps the transaction open — avoids
        # expire_on_commit breaking subsequent attribute accesses in the
        # same async session.
        await self.db.flush()

        return f"Added {quantity} x {product.name} to cart. Cart now has {len(cart)} item(s)."

    async def checkout(self):
        """Checkout pending items in the cart."""
        cart_items = await self.get_cart()
        if not cart_items:
            return "Cart is empty."

        # Verify stocks & calculate total
        total_amount = 0.0
        db_order_items = []

        for item in cart_items:
            stmt = select(models.Product).filter(
                models.Product.id == item["product_id"]
            )
            res = await self.db.execute(stmt)
            product = res.scalars().first()

            if not product:
                return f"Product ID {item['product_id']} not found."
            if product.stock_quantity < item["quantity"]:
                return f"Not enough stock for {product.name}."

            # Deduct stock
            product.stock_quantity -= item["quantity"]
            price = float(product.price)
            total_amount += price * item["quantity"]

            db_order_items.append(models.OrderItem(
                product_id=product.id,
                quantity=item["quantity"],
                price_at_purchase=price
            ))

        # Create order and flush to get auto-generated ID
        new_order = models.Order(
            user_id=self.user_id,
            total_amount=total_amount,
            status="Pending"
        )
        self.db.add(new_order)
        await self.db.flush()           # generates new_order.id via sequence
        await self.db.refresh(new_order)  # load the generated id / defaults

        for db_item in db_order_items:
            db_item.order_id = new_order.id
            self.db.add(db_item)

        # Clear cart
        stmt_sess = select(models.AgentSession).filter(
            models.AgentSession.id == self.session_id
        )
        res_sess = await self.db.execute(stmt_sess)
        session = res_sess.scalars().first()
        session.cart_state = "[]"

        await self.db.flush()  # flush cart clear — final commit done by service.py

        return f"Order placed successfully! Order ID: {new_order.id}. Total: ${total_amount:.2f}"
