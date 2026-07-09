import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy.future import select
from app.db.models import User, TripRecord, TripMember
from app.config import settings

async def migrate_trips():
    engine = create_async_engine(settings.database_url, echo=True)
    async_session = sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)

    async with async_session() as session:
        # Find Aryan's user account
        result = await session.execute(select(User).where(User.email == "aryanka120505@gmail.com"))
        aryan = result.scalars().first()
        
        if not aryan:
            print("User aryanka120505@gmail.com not found!")
            return
            
        print(f"Found user: {aryan.name} (ID: {aryan.id})")
        
        # Get all trips
        trips_result = await session.execute(select(TripRecord))
        trips = trips_result.scalars().all()
        
        print(f"Found {len(trips)} trips in the database. Updating owner to Aryan...")
        
        for trip in trips:
            trip.owner_id = aryan.id
            
            # Check if Aryan is already a member
            member_result = await session.execute(
                select(TripMember).where(TripMember.trip_id == trip.id, TripMember.user_id == aryan.id)
            )
            member = member_result.scalars().first()
            
            if not member:
                # Add Aryan as an admin member
                new_member = TripMember(trip_id=trip.id, user_id=aryan.id, role="admin")
                session.add(new_member)
                print(f"Added Aryan as member to trip {trip.id}")
            else:
                member.role = "admin"
                
        await session.commit()
        print("Migration complete!")

if __name__ == "__main__":
    asyncio.run(migrate_trips())
