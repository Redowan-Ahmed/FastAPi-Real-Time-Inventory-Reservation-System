import redis.asyncio as redis
from core.config import settings

redis_client: redis.Redis = None


async def get_redis() -> redis.Redis:
    global redis_client
    if redis_client is None:
        redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)
    return redis_client


async def close_redis():
    global redis_client
    if redis_client:
        await redis_client.close()


async def rate_limit_check(user_id: str, limit: int = 10, window: int = 60) -> bool:
    r = await get_redis()
    key = f"rate_limit:{user_id}"
    current = await r.incr(key)
    if current == 1:
        await r.expire(key, window)
    return current <= limit


async def cache_product_inventory(product_id: int, inventory: int, ttl: int = 5):
    r = await get_redis()
    key = f"product_inventory:{product_id}"
    await r.setex(key, ttl, str(inventory))


async def get_cached_inventory(product_id: int) -> int | None:
    r = await get_redis()
    key = f"product_inventory:{product_id}"
    cached = await r.get(key)
    return int(cached) if cached else None


async def invalidate_inventory_cache(product_id: int):
    r = await get_redis()
    key = f"product_inventory:{product_id}"
    await r.delete(key)
