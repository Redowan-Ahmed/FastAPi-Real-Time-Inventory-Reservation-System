import asyncio
import json
import signal
import sys
from datetime import datetime, timedelta
from uuid import UUID

import aio_pika
from sqlalchemy.ext.asyncio import AsyncSession

from core.config import settings
from core.database import AsyncSessionLocal
from core.rabbitmq import get_rabbitmq_channel
from repositories import ProductRepository, ReservationRepository
from models.user import User
from core.redis import cache_product_inventory, invalidate_inventory_cache


async def process_reservation(job_data: dict):
    async with AsyncSessionLocal() as db:
        product_repo = ProductRepository(db)
        reservation_repo = ReservationRepository(db)

        product_id = UUID(job_data["product_id"])
        user_id = UUID(job_data["user_id"])
        quantity = job_data["quantity"]

        success = await product_repo.atomic_decrement_inventory(product_id, quantity)

        if not success:
            print(
                f"Failed to reserve inventory for product {product_id}, quantity {quantity}"
            )
            return False

        expires_at = datetime.utcnow() + timedelta(
            minutes=settings.RESERVATION_TIMEOUT_MINUTES
        )

        reservation = await reservation_repo.create(
            user_id, product_id, quantity, expires_at
        )

        print(
            f"Created reservation {reservation.id} for user {user_id}, product {product_id}, quantity {quantity}"
        )

        await db.commit()
        return True


async def on_message(message: aio_pika.IncomingMessage):
    async with message.process():
        try:
            job_data = json.loads(message.body.decode())
            print(f"Processing reservation job: {job_data['job_id']}", flush=True)

            success = await process_reservation(job_data)

            if not success:
                print(f"Failed to process job: {job_data['job_id']}", flush=True)
        except Exception as e:
            print(f"Error processing message: {e}", flush=True)
            await message.nack(requeue=False)


async def run_worker():
    print("Connecting to RabbitMQ...", flush=True)
    channel = await get_rabbitmq_channel()
    print("Connected to RabbitMQ", flush=True)

    exchange = await channel.declare_exchange(
        "reservations", aio_pika.ExchangeType.DIRECT, durable=True
    )

    queue = await channel.declare_queue("reservation_jobs", durable=True)
    await queue.bind(exchange, routing_key="reservation")

    await queue.consume(on_message)

    print("Worker started. Waiting for messages...", flush=True)

    stop_event = asyncio.Event()

    def signal_handler(sig, frame):
        print("Received shutdown signal", flush=True)
        stop_event.set()

    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)

    await stop_event.wait()


async def run_expiration_worker():
    while True:
        try:
            async with AsyncSessionLocal() as db:
                reservation_repo = ReservationRepository(db)
                product_repo = ProductRepository(db)

                expired = await reservation_repo.get_expired_reservations()

                for reservation in expired:
                    success = await product_repo.atomic_increment_inventory(
                        reservation.product_id, reservation.quantity
                    )

                    if success:
                        await reservation_repo.mark_expired(reservation.id)
                        await invalidate_inventory_cache(reservation.product_id)
                        print(
                            f"Expired reservation {reservation.id}, restored inventory",
                            flush=True,
                        )

                await db.commit()
        except Exception as e:
            print(f"Error in expiration worker: {e}", flush=True)

        await asyncio.sleep(30)


async def main():
    print("Starting workers...", flush=True)

    await asyncio.gather(run_worker(), run_expiration_worker())


if __name__ == "__main__":
    asyncio.run(main())
