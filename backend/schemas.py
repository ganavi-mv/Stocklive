from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

# Auth Schemas
class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str
    created_at: datetime

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# Store Schemas
class StoreCreate(BaseModel):
    store_name: str
    category: str
    address: str
    phone: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    map_location_url: Optional[str] = None

class StoreUpdate(BaseModel):
    store_name: Optional[str] = None
    category: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    map_location_url: Optional[str] = None

class StoreResponse(BaseModel):
    id: int
    owner_id: int
    store_name: str
    category: str
    address: str
    phone: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    map_location_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Product Schemas
class ProductCreate(BaseModel):
    name: str
    category: str
    price: float
    availability: str = "In Stock"
    stock_quantity: Optional[int] = 10
    image_url: Optional[str] = None
    description: Optional[str] = None

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    price: Optional[float] = None
    availability: Optional[str] = None
    stock_quantity: Optional[int] = None
    image_url: Optional[str] = None
    description: Optional[str] = None

class ProductResponse(BaseModel):
    id: int
    store_id: Optional[int] = None
    name: str
    category: str
    price: float
    availability: str
    stock_quantity: Optional[int] = 10
    image_url: Optional[str] = None
    store_name: str
    description: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    # Extra fields for navigation & location
    store_latitude: Optional[float] = None
    store_longitude: Optional[float] = None
    store_address: Optional[str] = None
    store_map_location_url: Optional[str] = None

    class Config:
        from_attributes = True

# Wishlist & Stock Alert Schemas
class WishlistResponse(BaseModel):
    id: int
    user_id: int
    product_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class StockAlertResponse(BaseModel):
    id: int
    user_id: int
    product_id: int
    created_at: datetime

    class Config:
        from_attributes = True
