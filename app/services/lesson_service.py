from typing import List
from fastapi import HTTPException, status
from models.lesson import LessonCreate, LessonUpdate, Lesson
from repository.lesson_repository import lesson_repository
from repository.course_repository import course_repository
from repository.progress_repository import progress_repository
from core.log_config import logger


class LessonService:
    """Service for lesson business logic"""
    
    async def create_lesson(
        self, 
        course_id: str, 
        lesson_data: LessonCreate, 
        user_id: str
    ) -> Lesson:
        """Create a new lesson (only course owner can create)"""
        # Verify course exists and user is owner
        course = await course_repository.get_course_by_id(course_id)
        
        if not course:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Course not found"
            )
        
        if course.mentor_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to add lessons to this course"
            )
        
        # Create lesson
        lesson_in_db = await lesson_repository.create_lesson(lesson_data, course_id)
        
        return Lesson(
            _id=lesson_in_db.id,
            course_id=lesson_in_db.course_id,
            title=lesson_in_db.title,
            description=lesson_in_db.description,
            type=lesson_in_db.type,
            order=lesson_in_db.order,
            duration=lesson_in_db.duration,
            created_at=lesson_in_db.created_at
        )
    
    async def get_lessons_by_course(self, course_id: str) -> List[Lesson]:
        """Get all lessons for a course"""
        # Verify course exists
        course = await course_repository.get_course_by_id(course_id)
        
        if not course:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Course not found"
            )
        
        lessons_in_db = await lesson_repository.get_lessons_by_course(course_id)
        
        return [Lesson(
            _id=l.id,
            course_id=l.course_id,
            title=l.title,
            description=l.description,
            type=l.type,
            order=l.order,
            duration=l.duration,
            created_at=l.created_at
        ) for l in lessons_in_db]
    
    async def get_lesson_by_id(self, lesson_id: str) -> Lesson:
        """Get lesson by ID"""
        lesson_in_db = await lesson_repository.get_lesson_by_id(lesson_id)
        
        if not lesson_in_db:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Lesson not found"
            )
        
        return Lesson(
            _id=lesson_in_db.id,
            course_id=lesson_in_db.course_id,
            title=lesson_in_db.title,
            description=lesson_in_db.description,
            type=lesson_in_db.type,
            order=lesson_in_db.order,
            duration=lesson_in_db.duration,
            created_at=lesson_in_db.created_at
        )
    
    async def update_lesson(
        self, 
        lesson_id: str, 
        lesson_update: LessonUpdate, 
        user_id: str
    ) -> Lesson:
        """Update a lesson (only course owner can update)"""
        # Get existing lesson
        lesson_in_db = await lesson_repository.get_lesson_by_id(lesson_id)
        
        if not lesson_in_db:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Lesson not found"
            )
        
        # Verify course ownership
        course = await course_repository.get_course_by_id(lesson_in_db.course_id)
        
        if not course or course.mentor_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to update this lesson"
            )
        
        # Update lesson
        updated_lesson = await lesson_repository.update_lesson(lesson_id, lesson_update)
        
        if not updated_lesson:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update lesson"
            )
        
        return Lesson(
            _id=updated_lesson.id,
            course_id=updated_lesson.course_id,
            title=updated_lesson.title,
            description=updated_lesson.description,
            type=updated_lesson.type,
            order=updated_lesson.order,
            duration=updated_lesson.duration,
            created_at=updated_lesson.created_at
        )
    
    async def delete_lesson(self, lesson_id: str, user_id: str) -> dict:
        """Delete a lesson (only course owner can delete)"""
        # Get existing lesson
        lesson_in_db = await lesson_repository.get_lesson_by_id(lesson_id)
        
        if not lesson_in_db:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Lesson not found"
            )
        
        # Verify course ownership
        course = await course_repository.get_course_by_id(lesson_in_db.course_id)
        
        if not course or course.mentor_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to delete this lesson"
            )
        
        # Delete lesson
        success = await lesson_repository.delete_lesson(lesson_id)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to delete lesson"
            )
        
        return {"message": "Lesson deleted successfully"}


# Create singleton instance
lesson_service = LessonService()

