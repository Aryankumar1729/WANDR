import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from app.db.models import Base
from app.config import settings

async def main():
    engine = create_async_engine(settings.database_url, echo=True)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    await engine.dispose()
    print("Vacay tables created successfully!")

if __name__ == "__main__":
    asyncio.run(main())
