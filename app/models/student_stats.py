from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class StudentStats(BaseModel):
    """Student overall statistics model"""
    id: str = Field(..., alias="_id")
    student_id: str
    total_enrolled_courses: int = 0
    total_approved_courses: int = 0
    total_completed_lessons: int = 0
    total_available_lessons: int = 0
    overall_progress_percentage: float = 0.0
    last_updated: datetime
    
    class Config:
        populate_by_name = True


class StudentStatsInDB(BaseModel):
    """Student statistics as stored in database"""
    id: str = Field(..., alias="_id")
    student_id: str
    total_enrolled_courses: int = 0
    total_approved_courses: int = 0
    total_completed_lessons: int = 0
    total_available_lessons: int = 0
    overall_progress_percentage: float = 0.0
    last_updated: datetime
    
    class Config:
        populate_by_name = True

