from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional
from uuid import UUID


class UserCreate(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: UUID
    email: str
    is_admin: bool
    created_at: datetime

    class Config:
        from_attributes = True


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class ProductCreate(BaseModel):
    name: str
    price: float
    total_inventory: int


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    price: Optional[float] = None
    total_inventory: Optional[int] = None
    available_inventory: Optional[int] = None


class ProductResponse(BaseModel):
    id: UUID
    name: str
    price: float
    total_inventory: int
    available_inventory: int
    created_at: datetime

    class Config:
        from_attributes = True


class ReservationCreate(BaseModel):
    product_id: UUID
    quantity: int


class ReservationResponse(BaseModel):
    id: UUID
    user_id: UUID
    product_id: UUID
    quantity: int
    status: str
    expires_at: datetime
    created_at: datetime
    product_name: Optional[str] = None
    product_price: Optional[float] = None

    class Config:
        from_attributes = True


class CheckoutResponse(BaseModel):
    message: str
    reservation: ReservationResponse
