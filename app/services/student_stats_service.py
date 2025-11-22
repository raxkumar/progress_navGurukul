from typing import Optional
from models.student_stats import StudentStats
from models.enrollment import EnrollmentStatus
from repository.student_stats_repository import student_stats_repository
from repository.enrollment_repository import enrollment_repository
from repository.lesson_repository import lesson_repository
from repository.progress_repository import progress_repository
from core.log_config import logger


class StudentStatsService:
    """Service for student statistics business logic"""
    
    async def get_student_stats(self, student_id: str) -> StudentStats:
        """Get student statistics, recalculate if not found"""
        # Try to get existing stats
        stats_in_db = await student_stats_repository.get_by_student_id(student_id)
        
        if stats_in_db:
            return StudentStats(
                _id=stats_in_db.id,
                student_id=stats_in_db.student_id,
                total_enrolled_courses=stats_in_db.total_enrolled_courses,
                total_approved_courses=stats_in_db.total_approved_courses,
                total_completed_lessons=stats_in_db.total_completed_lessons,
                total_available_lessons=stats_in_db.total_available_lessons,
                overall_progress_percentage=stats_in_db.overall_progress_percentage,
                last_updated=stats_in_db.last_updated
            )
        
        # If not found, calculate and create
        await self.recalculate_student_stats(student_id)
        
        # Get the newly created stats
        stats_in_db = await student_stats_repository.get_by_student_id(student_id)
        
        if stats_in_db:
            return StudentStats(
                _id=stats_in_db.id,
                student_id=stats_in_db.student_id,
                total_enrolled_courses=stats_in_db.total_enrolled_courses,
                total_approved_courses=stats_in_db.total_approved_courses,
                total_completed_lessons=stats_in_db.total_completed_lessons,
                total_available_lessons=stats_in_db.total_available_lessons,
                overall_progress_percentage=stats_in_db.overall_progress_percentage,
                last_updated=stats_in_db.last_updated
            )
        
        # Return empty stats if still not found
        return StudentStats(
            _id="",
            student_id=student_id,
            total_enrolled_courses=0,
            total_approved_courses=0,
            total_completed_lessons=0,
            total_available_lessons=0,
            overall_progress_percentage=0.0,
            last_updated=None
        )
    
    async def recalculate_student_stats(self, student_id: str) -> None:
        """Recalculate and update student statistics"""
        try:
            # Get all enrollments for the student
            enrollments, _ = await enrollment_repository.get_enrollments_by_student(
                student_id, skip=0, limit=1000
            )
            
            total_enrolled_courses = len(enrollments)
            total_approved_courses = sum(
                1 for e in enrollments if e.status == EnrollmentStatus.APPROVED
            )
            
            # Get approved course IDs
            approved_course_ids = [
                e.course_id for e in enrollments if e.status == EnrollmentStatus.APPROVED
            ]
            
            # Calculate total lessons and completed lessons for approved courses
            total_available_lessons = 0
            total_completed_lessons = 0
            
            for course_id in approved_course_ids:
                # Get all lessons for this course
                lessons = await lesson_repository.get_lessons_by_course(course_id)
                total_available_lessons += len(lessons)
                
                # Get completed lessons for this student in this course
                progress_records = await progress_repository.get_student_progress_for_course(
                    student_id, course_id
                )
                completed_in_course = sum(1 for p in progress_records if p.completed)
                total_completed_lessons += completed_in_course
            
            # Calculate overall progress percentage
            overall_progress_percentage = 0.0
            if total_available_lessons > 0:
                overall_progress_percentage = round(
                    (total_completed_lessons / total_available_lessons) * 100, 2
                )
            
            # Update or create stats
            await student_stats_repository.create_or_update(
                student_id=student_id,
                total_enrolled_courses=total_enrolled_courses,
                total_approved_courses=total_approved_courses,
                total_completed_lessons=total_completed_lessons,
                total_available_lessons=total_available_lessons,
                overall_progress_percentage=overall_progress_percentage
            )
            
            logger.info(f"Recalculated stats for student {student_id}: "
                       f"{total_completed_lessons}/{total_available_lessons} lessons, "
                       f"{overall_progress_percentage}% complete")
            
        except Exception as e:
            logger.error(f"Error recalculating student stats for {student_id}: {e}")
            raise


# Create singleton instance
student_stats_service = StudentStatsService()

