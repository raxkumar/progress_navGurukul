from typing import List
from fastapi import HTTPException, status
from models.progress import Progress, CourseProgress
from repository.progress_repository import progress_repository
from repository.lesson_repository import lesson_repository
from repository.enrollment_repository import enrollment_repository
from repository.course_repository import course_repository
from models.enrollment import EnrollmentStatus
from core.log_config import logger


class ProgressService:
    """Service for progress tracking business logic"""
    
    async def mark_lesson_complete(self, lesson_id: str, student_id: str) -> Progress:
        """Mark a lesson as complete (only enrolled students)"""
        # Get lesson
        lesson = await lesson_repository.get_lesson_by_id(lesson_id)
        
        if not lesson:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Lesson not found"
            )
        
        # Check if student is enrolled in the course
        enrollment = await enrollment_repository.check_enrollment_exists(
            student_id, 
            lesson.course_id
        )
        
        if not enrollment or enrollment.status != EnrollmentStatus.APPROVED:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You must be enrolled in this course to mark lessons as complete"
            )
        
        # Mark lesson complete
        progress_in_db = await progress_repository.mark_lesson_complete(
            student_id, 
            lesson_id, 
            lesson.course_id
        )
        
        logger.info(f"Student {student_id} completed lesson {lesson_id}")
        
        return Progress(
            _id=progress_in_db.id,
            student_id=progress_in_db.student_id,
            lesson_id=progress_in_db.lesson_id,
            course_id=progress_in_db.course_id,
            completed=progress_in_db.completed,
            completed_at=progress_in_db.completed_at
        )
    
    async def get_student_course_progress(self, course_id: str, student_id: str) -> CourseProgress:
        """Get student's progress for a specific course"""
        # Verify course exists
        course = await course_repository.get_course_by_id(course_id)
        
        if not course:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Course not found"
            )
        
        # Check enrollment
        enrollment = await enrollment_repository.check_enrollment_exists(student_id, course_id)
        
        if not enrollment or enrollment.status != EnrollmentStatus.APPROVED:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You must be enrolled in this course to view progress"
            )
        
        # Get total lessons
        lessons = await lesson_repository.get_lessons_by_course(course_id)
        total_lessons = len(lessons)
        
        # Calculate progress
        course_progress = await progress_repository.calculate_course_completion_percentage(
            student_id,
            course_id,
            total_lessons
        )
        
        return course_progress
    
    async def get_student_progress_details(self, course_id: str, student_id: str) -> List[Progress]:
        """Get detailed progress for a student in a course"""
        # Verify course exists
        course = await course_repository.get_course_by_id(course_id)
        
        if not course:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Course not found"
            )
        
        # Check enrollment
        enrollment = await enrollment_repository.check_enrollment_exists(student_id, course_id)
        
        if not enrollment or enrollment.status != EnrollmentStatus.APPROVED:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You must be enrolled in this course to view progress"
            )
        
        # Get progress
        progress_list = await progress_repository.get_student_progress_for_course(
            student_id, 
            course_id
        )
        
        return [Progress(
            _id=p.id,
            student_id=p.student_id,
            lesson_id=p.lesson_id,
            course_id=p.course_id,
            completed=p.completed,
            completed_at=p.completed_at
        ) for p in progress_list]
    
    async def get_mentor_student_progress(
        self, 
        course_id: str, 
        student_id: str, 
        mentor_id: str
    ) -> CourseProgress:
        """Get a student's progress for mentor's course (mentor only)"""
        # Verify course exists and mentor owns it
        course = await course_repository.get_course_by_id(course_id)
        
        if not course:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Course not found"
            )
        
        if course.mentor_id != mentor_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to view this student's progress"
            )
        
        # Get total lessons
        lessons = await lesson_repository.get_lessons_by_course(course_id)
        total_lessons = len(lessons)
        
        # Calculate progress
        course_progress = await progress_repository.calculate_course_completion_percentage(
            student_id,
            course_id,
            total_lessons
        )
        
        return course_progress
    
    async def is_lesson_completed(self, lesson_id: str, student_id: str) -> bool:
        """Check if a lesson is completed by a student"""
        return await progress_repository.is_lesson_completed(student_id, lesson_id)


# Create singleton instance
progress_service = ProgressService()

