from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from .. import schemas, models, deps
from ..database import get_db

router = APIRouter(
    prefix="/orders",
    tags=["orders"]
)

@router.post("/", response_model=schemas.OrderResponse)
async def create_order(
    order_in: schemas.OrderCreate, 
    current_user: models.User = Depends(deps.get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Calculate total and verify products
    total_amount = 0
    db_items = []
    
    for item in order_in.items:
        result = await db.execute(select(models.Product).filter(models.Product.id == item.product_id))
        product = result.scalars().first()
        if not product:
            raise HTTPException(status_code=400, detail=f"Product {item.product_id} not found")
        if product.stock_quantity < item.quantity:
             raise HTTPException(status_code=400, detail=f"Not enough stock for {product.name}")
        
        # Deduct stock
        product.stock_quantity -= item.quantity
        
        price = product.price
        total_amount += price * item.quantity
        
        db_items.append(models.OrderItem(
            product_id=product.id,
            quantity=item.quantity,
            price_at_purchase=price
        ))

    new_order = models.Order(
        user_id=current_user.id,
        total_amount=total_amount,
        status="Pending"
    )
    db.add(new_order)
    await db.commit()
    await db.refresh(new_order)
    
    # Add items
    for db_item in db_items:
        db_item.order_id = new_order.id
        db.add(db_item)
    
    await db.commit()
    
    # Reload with items
    result = await db.execute(select(models.Order).filter(models.Order.id == new_order.id).options(selectinload(models.Order.items)))
    return result.scalars().first()

@router.get("/", response_model=List[schemas.OrderResponse])
async def get_orders(
    current_user: models.User = Depends(deps.get_current_user),
    db: AsyncSession = Depends(get_db)
):
    query = select(models.Order).filter(models.Order.user_id == current_user.id).options(selectinload(models.Order.items))
    result = await db.execute(query)
    return result.scalars().all()

# Admin Routes
@router.get("/admin/all", response_model=List[schemas.OrderResponse])
async def get_all_orders(
    current_user: models.User = Depends(deps.get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    query = select(models.Order).options(selectinload(models.Order.items))
    result = await db.execute(query)
    return result.scalars().all()
