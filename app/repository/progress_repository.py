from typing import Optional, List
from datetime import datetime
from bson import ObjectId
from models.progress import ProgressInDB, CourseProgress
from core.mongodb import get_database
from core.log_config import logger


class ProgressRepository:
    """Repository for progress database operations"""
    
    def __init__(self):
        self.collection_name = "progress"
    
    @property
    def collection(self):
        """Get progress collection - lazily fetches database"""
        db = get_database()
        return db[self.collection_name]
    
    async def mark_lesson_complete(self, student_id: str, lesson_id: str, course_id: str) -> ProgressInDB:
        """Mark a lesson as complete"""
        # Check if already exists
        existing = await self.collection.find_one({
            "student_id": student_id,
            "lesson_id": lesson_id
        })
        
        if existing:
            # Update existing
            await self.collection.update_one(
                {"_id": existing["_id"]},
                {"$set": {
                    "completed": True,
                    "completed_at": datetime.utcnow()
                }}
            )
            logger.info(f"Updated progress for student {student_id}, lesson {lesson_id}")
        else:
            # Create new
            progress_dict = {
                "student_id": student_id,
                "lesson_id": lesson_id,
                "course_id": course_id,
                "completed": True,
                "completed_at": datetime.utcnow()
            }
            
            result = await self.collection.insert_one(progress_dict)
            logger.info(f"Created progress for student {student_id}, lesson {lesson_id}")
        
        # Get and return the progress
        progress = await self.collection.find_one({
            "student_id": student_id,
            "lesson_id": lesson_id
        })
        
        return ProgressInDB(
            _id=str(progress["_id"]),
            student_id=progress["student_id"],
            lesson_id=progress["lesson_id"],
            course_id=progress["course_id"],
            completed=progress["completed"],
            completed_at=progress.get("completed_at")
        )
    
    async def get_student_progress_for_course(self, student_id: str, course_id: str) -> List[ProgressInDB]:
        """Get student's progress for a specific course"""
        progress_list = []
        cursor = self.collection.find({
            "student_id": student_id,
            "course_id": course_id
        })
        
        async for progress in cursor:
            progress_list.append(ProgressInDB(
                _id=str(progress["_id"]),
                student_id=progress["student_id"],
                lesson_id=progress["lesson_id"],
                course_id=progress["course_id"],
                completed=progress["completed"],
                completed_at=progress.get("completed_at")
            ))
        
        return progress_list
    
    async def get_all_student_progress(self, student_id: str) -> List[ProgressInDB]:
        """Get all progress for a student"""
        progress_list = []
        cursor = self.collection.find({"student_id": student_id})
        
        async for progress in cursor:
            progress_list.append(ProgressInDB(
                _id=str(progress["_id"]),
                student_id=progress["student_id"],
                lesson_id=progress["lesson_id"],
                course_id=progress["course_id"],
                completed=progress["completed"],
                completed_at=progress.get("completed_at")
            ))
        
        return progress_list
    
    async def calculate_course_completion_percentage(
        self, 
        student_id: str, 
        course_id: str, 
        total_lessons: int
    ) -> CourseProgress:
        """Calculate completion percentage for a course"""
        completed_count = await self.collection.count_documents({
            "student_id": student_id,
            "course_id": course_id,
            "completed": True
        })
        
        percentage = (completed_count / total_lessons * 100) if total_lessons > 0 else 0
        
        return CourseProgress(
            course_id=course_id,
            total_lessons=total_lessons,
            completed_lessons=completed_count,
            completion_percentage=round(percentage, 2)
        )
    
    async def is_lesson_completed(self, student_id: str, lesson_id: str) -> bool:
        """Check if a lesson is completed by a student"""
        progress = await self.collection.find_one({
            "student_id": student_id,
            "lesson_id": lesson_id,
            "completed": True
        })
        return progress is not None


# Create singleton instance
progress_repository = ProgressRepository()

