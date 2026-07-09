from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from pydantic import BaseModel, EmailStr
from app.db.database import get_db
from app.db.models import User
from app.auth.security import get_password_hash, verify_password, create_access_token
from app.services.email_service import send_email
import random
import string

router = APIRouter(prefix="/auth", tags=["auth"])

class UserCreate(BaseModel):
    email: EmailStr
    name: str
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class OTPVerify(BaseModel):
    email: EmailStr
    otp: str

def generate_otp():
    return ''.join(random.choices(string.digits, k=6))

@router.post("/register")
async def register(user: UserCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == user.email))
    existing_user = result.scalars().first()
    
    otp = generate_otp()
    hashed_password = get_password_hash(user.password)

    if existing_user:
        if existing_user.is_verified:
            raise HTTPException(status_code=400, detail="Email already registered and verified")
        else:
            # Update existing unverified user
            existing_user.password_hash = hashed_password
            existing_user.name = user.name
            existing_user.otp_code = otp
            await db.commit()
    else:
        new_user = User(email=user.email, name=user.name, password_hash=hashed_password, otp_code=otp, is_verified=False)
        db.add(new_user)
        await db.commit()
    
    import os
    
    # Send OTP Email
    template_path = os.path.join(os.path.dirname(__file__), "../templates/otp_email.html")
    with open(template_path, "r") as f:
        email_body = f.read()
    
    email_body = email_body.replace("{{name}}", user.name).replace("{{otp}}", otp)
    
    send_email(
        to_email=user.email,
        subject="Your WANDR Verification Code",
        body=email_body
    )
    
    return {"status": "pending_verification", "message": "OTP sent to email"}

@router.post("/verify-otp")
async def verify_otp(data: OTPVerify, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == data.email))
    db_user = result.scalars().first()
    
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if db_user.is_verified:
        raise HTTPException(status_code=400, detail="User is already verified")
        
    if db_user.otp_code != data.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")
        
    # Mark as verified
    db_user.is_verified = True
    db_user.otp_code = None
    await db.commit()
    
    # Issue JWT
    access_token = create_access_token(data={"sub": db_user.email})
    return {"access_token": access_token, "token_type": "bearer", "user": {"id": db_user.id, "email": db_user.email, "name": db_user.name}}

@router.post("/login")
async def login(user: UserLogin, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == user.email))
    db_user = result.scalars().first()
    
    if not db_user or not verify_password(user.password, db_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    if not db_user.is_verified:
        raise HTTPException(status_code=403, detail="Please verify your email first")
        
    access_token = create_access_token(data={"sub": db_user.email})
    return {"access_token": access_token, "token_type": "bearer", "user": {"id": db_user.id, "email": db_user.email, "name": db_user.name}}
