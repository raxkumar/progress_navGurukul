from typing import List
from fastapi import HTTPException, status
from models.enrollment import EnrollmentCreate, EnrollmentStatus, Enrollment
from repository.enrollment_repository import enrollment_repository
from repository.course_repository import course_repository
from core.log_config import logger


class EnrollmentService:
    """Service for enrollment business logic"""
    
    async def request_enrollment(self, enrollment_data: EnrollmentCreate, student_id: str) -> Enrollment:
        """Request enrollment in a course (student only)"""
        # Verify course exists
        course = await course_repository.get_course_by_id(enrollment_data.course_id)
        
        if not course:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Course not found"
            )
        
        # Check if enrollment already exists
        existing_enrollment = await enrollment_repository.check_enrollment_exists(
            student_id, 
            enrollment_data.course_id
        )
        
        if existing_enrollment:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Enrollment already exists with status: {existing_enrollment.status.value}"
            )
        
        # Create enrollment request
        enrollment_in_db = await enrollment_repository.create_enrollment_request(
            enrollment_data, 
            student_id
        )
        
        return Enrollment(
            _id=enrollment_in_db.id,
            student_id=enrollment_in_db.student_id,
            course_id=enrollment_in_db.course_id,
            status=enrollment_in_db.status,
            requested_at=enrollment_in_db.requested_at,
            approved_at=enrollment_in_db.approved_at,
            approved_by=enrollment_in_db.approved_by
        )
    
    async def get_student_enrollments(self, student_id: str) -> List[Enrollment]:
        """Get all enrollments for a student"""
        enrollments_in_db = await enrollment_repository.get_enrollments_by_student(student_id)
        
        return [Enrollment(
            _id=e.id,
            student_id=e.student_id,
            course_id=e.course_id,
            status=e.status,
            requested_at=e.requested_at,
            approved_at=e.approved_at,
            approved_by=e.approved_by
        ) for e in enrollments_in_db]
    
    async def get_course_enrollments(self, course_id: str, user_id: str) -> List[Enrollment]:
        """Get all enrollments for a course (only course owner)"""
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
                detail="You don't have permission to view enrollments for this course"
            )
        
        enrollments_in_db = await enrollment_repository.get_enrollments_by_course(course_id)
        
        return [Enrollment(
            _id=e.id,
            student_id=e.student_id,
            course_id=e.course_id,
            status=e.status,
            requested_at=e.requested_at,
            approved_at=e.approved_at,
            approved_by=e.approved_by
        ) for e in enrollments_in_db]
    
    async def approve_enrollment(self, enrollment_id: str, user_id: str) -> Enrollment:
        """Approve an enrollment request (only course owner)"""
        # Get enrollment
        enrollment_in_db = await enrollment_repository.get_enrollment_by_id(enrollment_id)
        
        if not enrollment_in_db:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Enrollment not found"
            )
        
        # Verify course ownership
        course = await course_repository.get_course_by_id(enrollment_in_db.course_id)
        
        if not course or course.mentor_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to approve this enrollment"
            )
        
        # Check if already processed
        if enrollment_in_db.status != EnrollmentStatus.PENDING:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Enrollment is already {enrollment_in_db.status.value}"
            )
        
        # Approve enrollment
        updated_enrollment = await enrollment_repository.update_enrollment_status(
            enrollment_id,
            EnrollmentStatus.APPROVED,
            user_id
        )
        
        if not updated_enrollment:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to approve enrollment"
            )
        
        return Enrollment(
            _id=updated_enrollment.id,
            student_id=updated_enrollment.student_id,
            course_id=updated_enrollment.course_id,
            status=updated_enrollment.status,
            requested_at=updated_enrollment.requested_at,
            approved_at=updated_enrollment.approved_at,
            approved_by=updated_enrollment.approved_by
        )
    
    async def reject_enrollment(self, enrollment_id: str, user_id: str) -> Enrollment:
        """Reject an enrollment request (only course owner)"""
        # Get enrollment
        enrollment_in_db = await enrollment_repository.get_enrollment_by_id(enrollment_id)
        
        if not enrollment_in_db:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Enrollment not found"
            )
        
        # Verify course ownership
        course = await course_repository.get_course_by_id(enrollment_in_db.course_id)
        
        if not course or course.mentor_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to reject this enrollment"
            )
        
        # Check if already processed
        if enrollment_in_db.status != EnrollmentStatus.PENDING:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Enrollment is already {enrollment_in_db.status.value}"
            )
        
        # Reject enrollment
        updated_enrollment = await enrollment_repository.update_enrollment_status(
            enrollment_id,
            EnrollmentStatus.REJECTED,
            user_id
        )
        
        if not updated_enrollment:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to reject enrollment"
            )
        
        return Enrollment(
            _id=updated_enrollment.id,
            student_id=updated_enrollment.student_id,
            course_id=updated_enrollment.course_id,
            status=updated_enrollment.status,
            requested_at=updated_enrollment.requested_at,
            approved_at=updated_enrollment.approved_at,
            approved_by=updated_enrollment.approved_by
        )
    
    async def check_student_enrolled(self, student_id: str, course_id: str) -> bool:
        """Check if student is enrolled (approved) in a course"""
        enrollment = await enrollment_repository.check_enrollment_exists(student_id, course_id)
        return enrollment is not None and enrollment.status == EnrollmentStatus.APPROVED


# Create singleton instance
enrollment_service = EnrollmentService()

