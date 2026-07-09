import asyncio
import logging
from app.db.database import engine, Base
from app.db.models import TripRecord

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def init_db():
    logger.info("Initializing database...")
    async with engine.begin() as conn:
        logger.info("Dropping existing tables if they exist...")
        await conn.run_sync(Base.metadata.drop_all)
        logger.info("Creating tables...")
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database initialized successfully.")

if __name__ == "__main__":
    asyncio.run(init_db())
