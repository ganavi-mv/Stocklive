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

class StoreUpdate(BaseModel):
    store_name: Optional[str] = None
    category: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class StoreResponse(BaseModel):
    id: int
    owner_id: int
    store_name: str
    category: str
    address: str
    phone: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Product Schemas
class ProductResponse(BaseModel):
    id: int
    name: str
    category: str
    price: float
    availability: str
    image_url: Optional[str] = None
    store_name: str
    description: Optional[str] = None

    class Config:
        from_attributes = True
