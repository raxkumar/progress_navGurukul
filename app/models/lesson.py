from datetime import datetime
from typing import Optional
from enum import Enum
from pydantic import BaseModel, Field


class LessonType(str, Enum):
    """Lesson type enumeration"""
    PDF = "PDF"
    VIDEO = "VIDEO"
    PPT = "PPT"
    DOCUMENT = "DOCUMENT"
    OTHER = "OTHER"


class LessonCreate(BaseModel):
    """Lesson creation model"""
    title: str = Field(..., min_length=1, max_length=200)
    description: str
    type: LessonType
    order: int = Field(..., ge=0)
    duration: Optional[int] = Field(None, description="Duration in minutes")


class LessonUpdate(BaseModel):
    """Lesson update model"""
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    type: Optional[LessonType] = None
    order: Optional[int] = Field(None, ge=0)
    duration: Optional[int] = None


class Lesson(BaseModel):
    """Lesson response model"""
    id: str = Field(..., alias="_id")
    course_id: str
    title: str
    description: str
    type: LessonType
    order: int
    duration: Optional[int]
    created_at: datetime
    
    class Config:
        populate_by_name = True


class LessonInDB(BaseModel):
    """Lesson model as stored in database"""
    id: str = Field(..., alias="_id")
    course_id: str
    title: str
    description: str
    type: LessonType
    order: int
    duration: Optional[int]
    created_at: datetime
    
    class Config:
        populate_by_name = True

