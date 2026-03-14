from uuid import UUID
from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from core.security import get_current_user
from models.user import User
from schemas.schemas import (
    UserCreate,
    UserResponse,
    LoginRequest,
    TokenResponse,
    ProductCreate,
    ProductUpdate,
    ProductResponse,
    ReservationCreate,
    ReservationResponse,
    CheckoutResponse,
)
from services import AuthService, ProductService, ReservationService, CheckoutService
from core.config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse)
async def register(data: UserCreate, db: AsyncSession = Depends(get_db)):
    service = AuthService(db)
    token, error = await service.register(data)
    if error:
        raise HTTPException(status_code=400, detail=error)
    return TokenResponse(access_token=token)


@router.post("/login", response_model=TokenResponse)
async def login(data: LoginRequest, db: AsyncSession = Depends(get_db)):
    service = AuthService(db)
    token, error = await service.login(data.email, data.password)
    if error:
        raise HTTPException(status_code=401, detail=error)
    return TokenResponse(access_token=token)
