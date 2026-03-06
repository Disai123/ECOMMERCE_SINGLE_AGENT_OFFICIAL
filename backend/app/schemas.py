from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from decimal import Decimal

# User Schemas
class UserBase(BaseModel):
    email: str

class UserCreate(UserBase):
    password: str

class UserLogin(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    is_admin: bool
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# Product Schemas
class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: Decimal
    stock_quantity: int
    image_url: Optional[str] = None
    category_id: Optional[int] = None

class ProductCreate(ProductBase):
    pass

class ProductResponse(ProductBase):
    id: int
    category: Optional[str] = None  # category name (joined)

    class Config:
        from_attributes = True

# Order Schemas
class OrderItemBase(BaseModel):
    product_id: int
    quantity: int

class OrderCreate(BaseModel):
    items: List[OrderItemBase]

class OrderItemResponse(OrderItemBase):
    id: int
    price_at_purchase: Decimal

    class Config:
        from_attributes = True

class OrderResponse(BaseModel):
    id: int
    user_id: int
    total_amount: Decimal
    status: str
    created_at: datetime
    items: List[OrderItemResponse]

    class Config:
        from_attributes = True

# Agent Schemas
class AgentChatRequest(BaseModel):
    message: str
    session_id: str

class AgentChatResponse(BaseModel):
    response: str
    session_id: str
