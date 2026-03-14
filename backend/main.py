from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api import api_router
from core.database import init_db
from core.rabbitmq import close_rabbitmq
from core.redis import close_redis
from core.security import get_password_hash
from core.database import AsyncSessionLocal
from models.user import User, Product
from sqlalchemy import select
from datetime import datetime, timedelta
from core.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(User).where(User.email == "admin@example.com"))
        admin = result.scalar_one_or_none()
        if not admin:
            admin = User(
                email="admin@example.com",
                password_hash=get_password_hash("admin123"),
                is_admin=True,
            )
            db.add(admin)

            user = User(
                email="user@example.com",
                password_hash=get_password_hash("user123"),
                is_admin=False,
            )
            db.add(user)

            products = [
                Product(
                    name="iPhone 16 Pro",
                    price=999.99,
                    total_inventory=10,
                    available_inventory=10,
                ),
                Product(
                    name="MacBook Pro M4",
                    price=1999.99,
                    total_inventory=5,
                    available_inventory=5,
                ),
                Product(
                    name="AirPods Pro 3",
                    price=249.99,
                    total_inventory=50,
                    available_inventory=50,
                ),
                Product(
                    name="iPad Pro 13",
                    price=1199.99,
                    total_inventory=8,
                    available_inventory=8,
                ),
                Product(
                    name="Apple Watch Ultra 3",
                    price=799.99,
                    total_inventory=15,
                    available_inventory=15,
                ),
            ]
            for p in products:
                db.add(p)

            await db.commit()

    yield

    await close_rabbitmq()
    await close_redis()


app = FastAPI(
    title="RayShopEasy Inventory Reservation System",
    description="Real-time inventory reservation system for flash sales",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
