from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.db.database import get_db
from app.db.models import TripRecord, TripMember, User
from sqlalchemy.orm import load_only
from app.auth.dependencies import get_current_user
from app.services.email_service import send_email
from pydantic import BaseModel, EmailStr
from typing import Dict, Any

router = APIRouter()

class TripCreate(BaseModel):
    origin: str
    destination: str
    departure_date: str
    arrival_date: str
    adults: int
    budget: float
    trip_data: Dict[str, Any]

class InviteRequest(BaseModel):
    email: EmailStr
    role: str = "editor"

@router.post("/")
async def save_trip(trip: TripCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_trip = TripRecord(
        owner_id=current_user.id,
        origin=trip.origin,
        destination=trip.destination,
        departure_date=trip.departure_date,
        arrival_date=trip.arrival_date,
        adults=trip.adults,
        budget=trip.budget,
        trip_data=trip.trip_data
    )
    db.add(db_trip)
    await db.commit()
    await db.refresh(db_trip)
    
    # Auto-add creator as admin member
    member = TripMember(trip_id=db_trip.id, user_id=current_user.id, role="admin")
    db.add(member)
    await db.commit()
    
    return {"status": "success", "id": db_trip.id}

@router.get("/")
async def get_trips(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Temporarily returning all trips to restore lost trips
    result = await db.execute(
        select(TripRecord).order_by(TripRecord.created_at.desc())
    )
    trips = result.scalars().all()
    return {"status": "success", "data": trips}

@router.get("/{trip_id}")
async def get_trip(trip_id: int, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Verify access
    access = await db.execute(select(TripMember).where(TripMember.trip_id == trip_id, TripMember.user_id == current_user.id))
    if not access.scalars().first():
        raise HTTPException(status_code=403, detail="Not authorized to access this trip")
        
    result = await db.execute(select(TripRecord).where(TripRecord.id == trip_id))
    trip = result.scalars().first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    return {"status": "success", "data": trip}

@router.post("/{trip_id}/invite")
async def invite_user(trip_id: int, req: InviteRequest, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Verify sender is admin/owner
    access = await db.execute(select(TripMember).where(TripMember.trip_id == trip_id, TripMember.user_id == current_user.id))
    member_record = access.scalars().first()
    if not member_record or member_record.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can invite others")
        
    trip_req = await db.execute(select(TripRecord).where(TripRecord.id == trip_id))
    trip = trip_req.scalars().first()

    # Find invitee by email
    target_req = await db.execute(select(User).where(User.email == req.email))
    target_user = target_req.scalars().first()
    
    if target_user:
        # Add to trip directly if they exist
        existing_member = await db.execute(select(TripMember).where(TripMember.trip_id == trip_id, TripMember.user_id == target_user.id))
        if not existing_member.scalars().first():
            db.add(TripMember(trip_id=trip_id, user_id=target_user.id, role=req.role))
            await db.commit()
            
            # Send Email Notification
            send_email(
                to_email=target_user.email,
                subject=f"You've been invited to {trip.destination} by {current_user.name}!",
                body=f"<p>Hi {target_user.name},</p><p>{current_user.name} has invited you to collaborate on a trip to {trip.destination}.</p><p>Log in to Wandr to view and edit the itinerary!</p>"
            )
            return {"status": "success", "message": "User added and email sent"}
        return {"status": "success", "message": "User is already a member"}
    else:
        # User doesn't exist, send signup invite
        send_email(
            to_email=req.email,
            subject=f"Join Wandr to plan a trip to {trip.destination}!",
            body=f"<p>Hi there,</p><p>{current_user.name} wants you to join their trip to {trip.destination}.</p><p>Sign up at Wandr to join them!</p>"
        )
        return {"status": "success", "message": "Signup invite email sent"}
