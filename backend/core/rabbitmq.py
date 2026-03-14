import json
import aio_pika
from core.config import settings

connection: aio_pika.Connection = None
channel: aio_pika.Channel = None


async def get_rabbitmq_channel() -> aio_pika.Channel:
    global connection, channel
    if connection is None or connection.is_closed:
        connection = await aio_pika.connect_robust(settings.RABBITMQ_URL)
    if channel is None or channel.is_closed:
        channel = await connection.channel()
    return channel


async def publish_reservation_job(job_data: dict):
    channel = await get_rabbitmq_channel()
    exchange = await channel.declare_exchange(
        "reservations", aio_pika.ExchangeType.DIRECT, durable=True
    )

    queue = await channel.declare_queue("reservation_jobs", durable=True)
    await queue.bind(exchange, routing_key="reservation")

    message = aio_pika.Message(
        body=json.dumps(job_data).encode(),
        delivery_mode=aio_pika.DeliveryMode.PERSISTENT,
        content_type="application/json",
    )
    await exchange.publish(message, routing_key="reservation")


async def close_rabbitmq():
    global connection, channel
    if channel:
        await channel.close()
    if connection:
        await connection.close()
