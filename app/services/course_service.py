from typing import List
from fastapi import HTTPException, status
from models.course import CourseCreate, CourseUpdate, Course
from models.user import UserRole
from repository.course_repository import course_repository
from repository.lesson_repository import lesson_repository
from core.log_config import logger


class CourseService:
    """Service for course business logic"""
    
    async def create_course(self, course_data: CourseCreate, mentor_id: str) -> Course:
        """Create a new course"""
        course_in_db = await course_repository.create_course(course_data, mentor_id)
        
        return Course(
            _id=course_in_db.id,
            title=course_in_db.title,
            description=course_in_db.description,
            mentor_id=course_in_db.mentor_id,
            created_at=course_in_db.created_at,
            updated_at=course_in_db.updated_at
        )
    
    async def get_course_by_id(self, course_id: str) -> Course:
        """Get course by ID"""
        course_in_db = await course_repository.get_course_by_id(course_id)
        
        if not course_in_db:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Course not found"
            )
        
        return Course(
            _id=course_in_db.id,
            title=course_in_db.title,
            description=course_in_db.description,
            mentor_id=course_in_db.mentor_id,
            created_at=course_in_db.created_at,
            updated_at=course_in_db.updated_at
        )
    
    async def get_all_courses(self) -> List[Course]:
        """Get all courses"""
        courses_in_db = await course_repository.get_all_courses()
        
        return [Course(
            _id=c.id,
            title=c.title,
            description=c.description,
            mentor_id=c.mentor_id,
            created_at=c.created_at,
            updated_at=c.updated_at
        ) for c in courses_in_db]
    
    async def get_mentor_courses(self, mentor_id: str) -> List[Course]:
        """Get courses created by a mentor"""
        courses_in_db = await course_repository.get_courses_by_mentor(mentor_id)
        
        return [Course(
            _id=c.id,
            title=c.title,
            description=c.description,
            mentor_id=c.mentor_id,
            created_at=c.created_at,
            updated_at=c.updated_at
        ) for c in courses_in_db]
    
    async def update_course(
        self, 
        course_id: str, 
        course_update: CourseUpdate, 
        user_id: str
    ) -> Course:
        """Update a course (only course owner can update)"""
        # Get existing course
        course_in_db = await course_repository.get_course_by_id(course_id)
        
        if not course_in_db:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Course not found"
            )
        
        # Check ownership
        if course_in_db.mentor_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to update this course"
            )
        
        # Update course
        updated_course = await course_repository.update_course(course_id, course_update)
        
        if not updated_course:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update course"
            )
        
        return Course(
            _id=updated_course.id,
            title=updated_course.title,
            description=updated_course.description,
            mentor_id=updated_course.mentor_id,
            created_at=updated_course.created_at,
            updated_at=updated_course.updated_at
        )
    
    async def delete_course(self, course_id: str, user_id: str) -> dict:
        """Delete a course (only course owner can delete)"""
        # Get existing course
        course_in_db = await course_repository.get_course_by_id(course_id)
        
        if not course_in_db:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Course not found"
            )
        
        # Check ownership
        if course_in_db.mentor_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to delete this course"
            )
        
        # Delete associated lessons first
        await lesson_repository.delete_lessons_by_course(course_id)
        
        # Delete course
        success = await course_repository.delete_course(course_id)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to delete course"
            )
        
        return {"message": "Course deleted successfully"}


# Create singleton instance
course_service = CourseService()

