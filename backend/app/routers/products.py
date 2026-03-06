from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from .. import schemas, models, deps
from ..database import get_db

router = APIRouter(
    prefix="/products",
    tags=["products"]
)

@router.get("/", response_model=List[schemas.ProductResponse])
async def get_products(
    skip: int = 0, 
    limit: int = 100, 
    category_id: Optional[int] = None,
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    query = select(models.Product).options(selectinload(models.Product.category))
    if category_id:
        query = query.filter(models.Product.category_id == category_id)
    if search:
        query = query.filter(models.Product.name.ilike(f"%{search}%"))
        
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    products = result.scalars().all()
    
    # Manually build response to include category name
    response = []
    for p in products:
        response.append(schemas.ProductResponse(
            id=p.id,
            name=p.name,
            description=p.description,
            price=p.price,
            stock_quantity=p.stock_quantity,
            image_url=p.image_url,
            category_id=p.category_id,
            category=p.category.name if p.category else None
        ))
    return response


@router.get("/{product_id}", response_model=schemas.ProductResponse)
async def get_product(product_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Product).filter(models.Product.id == product_id))
    product = result.scalars().first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

# Admin only routes
@router.post("/", response_model=schemas.ProductResponse)
async def create_product(
    product: schemas.ProductCreate, 
    db: AsyncSession = Depends(get_db), 
    current_user: models.User = Depends(deps.get_current_admin_user)
):
    new_product = models.Product(**product.dict())
    db.add(new_product)
    await db.commit()
    await db.refresh(new_product)
    return new_product

@router.delete("/{product_id}")
async def delete_product(
    product_id: int, 
    db: AsyncSession = Depends(get_db), 
    current_user: models.User = Depends(deps.get_current_admin_user)
):
    result = await db.execute(select(models.Product).filter(models.Product.id == product_id))
    product = result.scalars().first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    await db.delete(product)
    await db.commit()
    return {"message": "Product deleted"}
