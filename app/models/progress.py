from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class ProgressCreate(BaseModel):
    """Progress creation model"""
    lesson_id: str


class Progress(BaseModel):
    """Progress response model"""
    id: str = Field(..., alias="_id")
    student_id: str
    lesson_id: str
    course_id: str
    completed: bool
    completed_at: Optional[datetime] = None
    
    class Config:
        populate_by_name = True


class ProgressInDB(BaseModel):
    """Progress model as stored in database"""
    id: str = Field(..., alias="_id")
    student_id: str
    lesson_id: str
    course_id: str
    completed: bool
    completed_at: Optional[datetime] = None
    
    class Config:
        populate_by_name = True


class CourseProgress(BaseModel):
    """Course progress summary"""
    course_id: str
    total_lessons: int
    completed_lessons: int
    completion_percentage: float

