from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from core.database import get_db
from core.security import get_current_user
from models.user import User
from schemas.schemas import ReservationCreate, ReservationResponse, CheckoutResponse
from services import ReservationService, CheckoutService

router = APIRouter(prefix="/reservations", tags=["Reservations"])


@router.post("", status_code=status.HTTP_202_ACCEPTED)
async def create_reservation(
    data: ReservationCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = ReservationService(db)
    result, error = await service.create_reservation(current_user.id, data)
    if error:
        raise HTTPException(status_code=400, detail=error)
    return result


@router.get("", response_model=List[ReservationResponse])
async def get_my_reservations(
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    service = ReservationService(db)
    return await service.get_user_reservations(current_user.id)


@router.get("/{reservation_id}", response_model=ReservationResponse)
async def get_reservation(
    reservation_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = ReservationService(db)
    reservation = await service.get_reservation(reservation_id)
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")
    if reservation.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Unauthorized")
    return reservation


@router.post("/checkout/{reservation_id}", response_model=CheckoutResponse)
async def checkout(
    reservation_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = CheckoutService(db)
    reservation, error = await service.checkout(reservation_id, current_user.id)
    if error:
        raise HTTPException(status_code=400, detail=error)
    return CheckoutResponse(
        message="Checkout completed successfully", reservation=reservation
    )
