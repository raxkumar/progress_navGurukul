from datetime import datetime
from typing import Optional
from enum import Enum
from pydantic import BaseModel, Field


class EnrollmentStatus(str, Enum):
    """Enrollment status enumeration"""
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"


class EnrollmentCreate(BaseModel):
    """Enrollment creation model"""
    course_id: str


class EnrollmentUpdate(BaseModel):
    """Enrollment update model"""
    status: EnrollmentStatus
    approved_by: Optional[str] = None


class Enrollment(BaseModel):
    """Enrollment response model"""
    id: str = Field(..., alias="_id")
    student_id: str
    course_id: str
    status: EnrollmentStatus
    requested_at: datetime
    approved_at: Optional[datetime] = None
    approved_by: Optional[str] = None
    
    class Config:
        populate_by_name = True


class EnrollmentInDB(BaseModel):
    """Enrollment model as stored in database"""
    id: str = Field(..., alias="_id")
    student_id: str
    course_id: str
    status: EnrollmentStatus
    requested_at: datetime
    approved_at: Optional[datetime] = None
    approved_by: Optional[str] = None
    
    class Config:
        populate_by_name = True

