from uuid import UUID, uuid4
from datetime import datetime, timedelta
from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession

from repositories import UserRepository, ProductRepository, ReservationRepository
from schemas.schemas import (
    UserCreate,
    ProductCreate,
    ProductUpdate,
    ProductResponse,
    ReservationCreate,
    ReservationResponse,
)
from core.security import verify_password, create_access_token
from core.config import settings
from core.redis import rate_limit_check, get_cached_inventory
from core.rabbitmq import publish_reservation_job


class AuthService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = UserRepository(db)

    async def register(self, data: UserCreate) -> tuple[Optional[str], Optional[str]]:
        existing = await self.repo.get_by_email(data.email)
        if existing:
            return None, "Email already registered"

        user = await self.repo.create(data.email, data.password)
        token = create_access_token(data={"sub": user.email, "is_admin": user.is_admin})
        return token, None

    async def login(
        self, email: str, password: str
    ) -> tuple[Optional[str], Optional[str]]:
        user = await self.repo.get_by_email(email)
        if not user or not verify_password(password, user.password_hash):
            return None, "Invalid email or password"

        token = create_access_token(data={"sub": user.email, "is_admin": user.is_admin})
        return token, None


class ProductService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = ProductRepository(db)

    async def create(
        self, data: ProductCreate, is_admin: bool
    ) -> Optional[ProductResponse]:
        if not is_admin:
            return None
        product = await self.repo.create(data)
        return ProductResponse.model_validate(product)

    async def get_all(self) -> list[ProductResponse]:
        products = await self.repo.get_all()
        return [ProductResponse.model_validate(p) for p in products]

    async def get_by_id(self, product_id: UUID) -> Optional[ProductResponse]:
        cached = await get_cached_inventory(product_id)
        product = await self.repo.get_by_id(product_id)
        if not product:
            return None

        response = ProductResponse.model_validate(product)
        if cached is not None:
            response.available_inventory = cached
        return response

    async def update(
        self, product_id: UUID, data: ProductUpdate, is_admin: bool
    ) -> Optional[ProductResponse]:
        if not is_admin:
            return None
        product = await self.repo.update(product_id, data)
        if not product:
            return None
        return ProductResponse.model_validate(product)


class ReservationService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.product_repo = ProductRepository(db)
        self.reservation_repo = ReservationRepository(db)
        self.user_repo = UserRepository(db)

    async def create_reservation(
        self, user_id: UUID, data: ReservationCreate
    ) -> tuple[Optional[dict], Optional[str]]:
        user = await self.user_repo.get_by_id(user_id)
        if not user:
            return None, "User not found"

        if not await rate_limit_check(str(user_id)):
            return None, "Rate limit exceeded. Please try again later."

        if data.quantity <= 0:
            return None, "Quantity must be greater than 0"

        job_id = str(uuid4())

        await publish_reservation_job(
            {
                "job_id": job_id,
                "product_id": str(data.product_id),
                "user_id": str(user_id),
                "quantity": data.quantity,
            }
        )

        return {
            "job_id": job_id,
            "status": "processing",
            "message": "Reservation is being processed",
        }, None

    async def get_user_reservations(self, user_id: UUID) -> list[ReservationResponse]:
        reservations = await self.reservation_repo.get_user_reservations(user_id)
        result = []
        for r in reservations:
            resp = ReservationResponse.model_validate(r)
            if r.product:
                resp.product_name = r.product.name
                resp.product_price = float(r.product.price)
            result.append(resp)
        return result

    async def get_reservation(
        self, reservation_id: UUID
    ) -> Optional[ReservationResponse]:
        reservation = await self.reservation_repo.get_by_id(reservation_id)
        if not reservation:
            return None
        resp = ReservationResponse.model_validate(reservation)
        if reservation.product:
            resp.product_name = reservation.product.name
            resp.product_price = float(reservation.product.price)
        return resp


class CheckoutService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.reservation_repo = ReservationRepository(db)

    async def checkout(
        self, reservation_id: UUID, user_id: UUID
    ) -> tuple[Optional[ReservationResponse], Optional[str]]:
        reservation = await self.reservation_repo.get_by_id(reservation_id)

        if not reservation:
            return None, "Reservation not found"

        if reservation.user_id != user_id:
            return None, "Unauthorized"

        if reservation.status != "reserved":
            return None, f"Cannot checkout. Reservation status is: {reservation.status}"

        if reservation.expires_at < datetime.utcnow():
            await self.reservation_repo.mark_expired(reservation_id)
            return None, "Reservation has expired"

        success = await self.reservation_repo.complete(reservation_id)
        if not success:
            return None, "Failed to complete checkout"

        updated = await self.reservation_repo.get_by_id(reservation_id)
        resp = ReservationResponse.model_validate(updated)
        if updated.product:
            resp.product_name = updated.product.name
            resp.product_price = float(updated.product.price)

        return resp, None
