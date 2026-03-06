"""Update product image URLs to working Unsplash images."""
import asyncio
from app.database import SessionLocal, engine
from app.models import Product
from sqlalchemy.future import select

PRODUCT_IMAGES = {
    "Smartphone X":       "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400&fit=crop",
    "Wireless Headphones":"https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&fit=crop",
    "Men's T-Shirt":      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&fit=crop",
    "Running Shoes":      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&fit=crop",
    "Coffee Maker":       "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=400&fit=crop",
}

async def update_images():
    async with SessionLocal() as session:
        result = await session.execute(select(Product))
        products = result.scalars().all()
        updated = 0
        for p in products:
            url = PRODUCT_IMAGES.get(p.name)
            if url:
                p.image_url = url
                updated += 1
                print(f"  [OK] {p.name}")
            else:
                print(f"  [SKIP] No image mapping for: {p.name}")
        await session.commit()
        print(f"\n[DONE] Updated {updated} products.")

if __name__ == "__main__":
    asyncio.run(update_images())
