from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from sqlalchemy.orm import selectinload
from typing import Optional

from models.user import User, Product, Reservation
from schemas.schemas import ProductCreate, ProductUpdate
from core.security import get_password_hash
from core.redis import cache_product_inventory


class UserRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, email: str, password: str, is_admin: bool = False) -> User:
        user = User(
            email=email, password_hash=get_password_hash(password), is_admin=is_admin
        )
        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)
        return user

    async def get_by_email(self, email: str) -> Optional[User]:
        result = await self.db.execute(select(User).where(User.email == email))
        return result.scalar_one_or_none()

    async def get_by_id(self, user_id: UUID) -> Optional[User]:
        result = await self.db.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()


class ProductRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, data: ProductCreate) -> Product:
        product = Product(
            name=data.name,
            price=data.price,
            total_inventory=data.total_inventory,
            available_inventory=data.total_inventory,
        )
        self.db.add(product)
        await self.db.commit()
        await self.db.refresh(product)
        await cache_product_inventory(str(product.id), product.available_inventory)
        return product

    async def get_all(self) -> list[Product]:
        result = await self.db.execute(select(Product))
        return list(result.scalars().all())

    async def get_by_id(self, product_id: UUID) -> Optional[Product]:
        result = await self.db.execute(select(Product).where(Product.id == product_id))
        return result.scalar_one_or_none()

    async def update(self, product_id: UUID, data: ProductUpdate) -> Optional[Product]:
        product = await self.get_by_id(product_id)
        if not product:
            return None

        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(product, key, value)

        await self.db.commit()
        await self.db.refresh(product)
        await cache_product_inventory(str(product.id), product.available_inventory)
        return product

    async def atomic_decrement_inventory(self, product_id: UUID, quantity: int) -> bool:
        result = await self.db.execute(
            update(Product)
            .where(Product.id == product_id, Product.available_inventory >= quantity)
            .values(available_inventory=Product.available_inventory - quantity)
            .returning(Product.id)
        )
        updated = result.scalar_one_or_none()
        if updated:
            product = await self.get_by_id(product_id)
            await cache_product_inventory(str(product_id), product.available_inventory)
        return updated is not None

    async def atomic_increment_inventory(self, product_id: UUID, quantity: int) -> bool:
        result = await self.db.execute(
            update(Product)
            .where(
                Product.id == product_id,
                Product.available_inventory + quantity <= Product.total_inventory,
            )
            .values(available_inventory=Product.available_inventory + quantity)
            .returning(Product.id)
        )
        updated = result.scalar_one_or_none()
        if updated:
            product = await self.get_by_id(product_id)
            await cache_product_inventory(str(product_id), product.available_inventory)
        return updated is not None


class ReservationRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(
        self, user_id: UUID, product_id: UUID, quantity: int, expires_at
    ) -> Reservation:
        reservation = Reservation(
            user_id=user_id,
            product_id=product_id,
            quantity=quantity,
            status="reserved",
            expires_at=expires_at,
        )
        self.db.add(reservation)
        await self.db.commit()
        await self.db.refresh(reservation)
        return reservation

    async def get_by_id(self, reservation_id: UUID) -> Optional[Reservation]:
        result = await self.db.execute(
            select(Reservation)
            .where(Reservation.id == reservation_id)
            .options(selectinload(Reservation.user), selectinload(Reservation.product))
        )
        return result.scalar_one_or_none()

    async def get_user_reservations(self, user_id: UUID) -> list[Reservation]:
        result = await self.db.execute(
            select(Reservation)
            .where(Reservation.user_id == user_id)
            .options(selectinload(Reservation.product))
            .order_by(Reservation.created_at.desc())
        )
        return list(result.scalars().all())

    async def complete(self, reservation_id: UUID) -> bool:
        result = await self.db.execute(
            update(Reservation)
            .where(Reservation.id == reservation_id, Reservation.status == "reserved")
            .values(status="completed")
            .returning(Reservation.id)
        )
        success = result.scalar_one_or_none() is not None
        if success:
            await self.db.commit()
        return success

    async def get_expired_reservations(self):
        from datetime import datetime
        from sqlalchemy import and_

        result = await self.db.execute(
            select(Reservation)
            .where(
                and_(
                    Reservation.status == "reserved",
                    Reservation.expires_at < datetime.utcnow(),
                )
            )
            .options(selectinload(Reservation.product))
        )
        return list(result.scalars().all())

    async def mark_expired(self, reservation_id: UUID) -> bool:
        result = await self.db.execute(
            update(Reservation)
            .where(Reservation.id == reservation_id, Reservation.status == "reserved")
            .values(status="expired")
            .returning(Reservation.id)
        )
        return result.scalar_one_or_none() is not None
