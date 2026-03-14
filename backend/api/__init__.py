from fastapi import APIRouter
from api.endpoints import auth, products, reservations

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(products.router)
api_router.include_router(reservations.router)
