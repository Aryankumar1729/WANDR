import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy import delete
from app.db.models import TripRecord, TripMember
from app.config import settings

async def main():
    engine = create_async_engine(settings.database_url, echo=True)
    async with AsyncSession(engine) as session:
        # Delete members first to avoid foreign key constraints
        await session.execute(delete(TripMember))
        # Delete trips
        await session.execute(delete(TripRecord))
        await session.commit()
    await engine.dispose()
    print("Successfully deleted all trips from the database.")

if __name__ == "__main__":
    asyncio.run(main())
