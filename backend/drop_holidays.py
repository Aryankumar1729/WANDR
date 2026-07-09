import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from app.config import settings

async def main():
    engine = create_async_engine(settings.database_url, echo=True)
    async with engine.begin() as conn:
        await conn.execute(text("DROP TABLE IF EXISTS vacay_company_holidays CASCADE;"))
        await conn.execute(text("ALTER TABLE vacay_plans DROP COLUMN IF EXISTS company_holidays_enabled;"))
    await engine.dispose()
    print("Cleaned up company holidays from database.")

if __name__ == "__main__":
    asyncio.run(main())
