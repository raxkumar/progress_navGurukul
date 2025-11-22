from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
from models.progress import CourseProgress
from models.enrollment import Enrollment


class CourseCreate(BaseModel):
    """Course creation model"""
    title: str = Field(..., min_length=1, max_length=200)
    description: str = Field(..., min_length=1)


class CourseUpdate(BaseModel):
    """Course update model"""
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None


class Course(BaseModel):
    """Course response model"""
    id: str = Field(..., alias="_id")
    title: str
    description: str
    mentor_id: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        populate_by_name = True


class CourseInDB(BaseModel):
    """Course model as stored in database"""
    id: str = Field(..., alias="_id")
    title: str
    description: str
    mentor_id: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        populate_by_name = True


class CourseWithProgress(Course):
    """Course with progress and enrollment information"""
    progress: Optional[CourseProgress] = None
    enrollment: Optional[Enrollment] = None

