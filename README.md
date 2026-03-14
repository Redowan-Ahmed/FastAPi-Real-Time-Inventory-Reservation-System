# Real-Time Inventory Reservation System

A production-ready distributed system for handling flash-sale scenarios with thousands of concurrent users attempting to reserve limited inventory. This is only for the ( Skill Test ), not a real-world ecommerce product; this is only for a simulation.

### Reservation Flow

1. **User submits reservation request** to `/reservations` endpoint
2. **API validates request** (authentication, product exists, quantity valid)
3. **API publishes job** to RabbitMQ with reservation details
4. **API returns response** to user with job status
5. **Worker picks up job** from queue
6. **Worker performs atomic inventory check and update**
7. **Worker creates reservation record** with 5-minute expiration
8. **Worker updates Redis cache** for product inventory
9. **User polls/checkout** to complete reservation

## Tech Stack

- **Frontend**: Next.js 16 (App Router), TypeScript, TailwindCSS, Zustand ( State manage )
- **Backend**: FastAPI, Python 3.11
- **Database**: PostgreSQL 15, SQLAlchemy 2.0 (async)
- **Cache**: Redis
- **Message Queue**: RabbitMQ
- **ORM**: SQLAlchemy async with asyncpg
- **Authentication**: JWT with bcrypt password hashing
- **Migrations**: Alembic

## How to Run the System

### Quick Start

```bash
# Clone the repository

git clone https://github.com/Redowan-Ahmed/FastAPi-Real-Time-Inventory-Reservation-System.git
cd FastAPi-Real-Time-Inventory-Reservation-System

# Start all services
docker compose up --build
```

### Access the Application

- **Frontend**: http://localhost:3000
- **API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **RabbitMQ Management**: http://localhost:15672 (guest/guest)
- **Redis**: localhost:6379

### Default Admin User
- Email: admin@example.com
- Password: admin123

### Test User
- Email: user@example.com
- Password: user123

## Environment Variables

### Backend
- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string
- `RABBITMQ_URL`: RabbitMQ connection string
- `SECRET_KEY`: JWT secret key
- `ALGORITHM`: JWT algorithm (HS256)
- `ACCESS_TOKEN_EXPIRE_MINUTES`: Token expiration time

### Frontend
- `NEXT_PUBLIC_API_URL`: Backend API URL

## Scaling Considerations

For production deployment:
1. Use multiple API instances behind a load balancer
2. Scale worker instances based on queue depth
3. Use Redis Cluster for caching
4. Use PostgreSQL read replicas with PGbouncer
5. Implement circuit breakers for external services
6. Add health check endpoints for all services
