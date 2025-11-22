from enum import Enum
from typing import Optional
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime


class UserRole(str, Enum):
    """User role enumeration"""
    STUDENT = "STUDENT"
    MENTOR = "MENTOR"


class UserBase(BaseModel):
    """Base user model with common fields"""
    email: EmailStr
    role: UserRole


class UserCreate(UserBase):
    """User creation model"""
    password: str = Field(..., min_length=6, description="Password must be at least 6 characters")


class UserLogin(BaseModel):
    """User login model"""
    email: EmailStr
    password: str
    role: UserRole


class User(UserBase):
    """User response model (without password)"""
    id: str = Field(..., alias="_id")
    created_at: datetime
    
    class Config:
        populate_by_name = True


class UserInDB(UserBase):
    """User model as stored in database"""
    id: str = Field(..., alias="_id")
    hashed_password: str
    created_at: datetime
    
    class Config:
        populate_by_name = True


class TokenData(BaseModel):
    """Token payload data"""
    user_id: str
    email: str
    role: UserRole


class TokenResponse(BaseModel):
    """Authentication token response"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: User


class RefreshTokenRequest(BaseModel):
    """Refresh token request model"""
    refresh_token: str

