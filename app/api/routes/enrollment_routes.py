from fastapi import APIRouter, Depends, status, Query
from typing import List
from models.enrollment import EnrollmentCreate, Enrollment
from models.course import CourseWithProgress
from models.pagination import PaginatedResponse
from models.user import TokenData
from services.enrollment_service import enrollment_service
from core.dependencies import get_current_student, get_current_mentor
from core.security import get_current_user

router = APIRouter()


@router.post(
    "/",
    response_model=Enrollment,
    status_code=status.HTTP_201_CREATED,
    summary="Request enrollment in a course"
)
async def request_enrollment(
    enrollment_data: EnrollmentCreate,
    current_user: TokenData = Depends(get_current_student)
):
    """
    Request enrollment in a course (Student only).
    
    - **course_id**: ID of the course to enroll in
    """
    return await enrollment_service.request_enrollment(enrollment_data, current_user.user_id)


@router.get(
    "/my-enrollments",
    response_model=List[Enrollment],
    summary="Get student's enrollments"
)
async def get_my_enrollments(current_user: TokenData = Depends(get_current_student)):
    """
    Get all enrollments for the current student (Student only).
    """
    return await enrollment_service.get_student_enrollments(current_user.user_id)


@router.get(
    "/my-courses",
    response_model=PaginatedResponse[CourseWithProgress],
    summary="Get student's enrolled courses with progress"
)
async def get_my_enrolled_courses(
    current_user: TokenData = Depends(get_current_student),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=100, description="Items per page")
):
    """
    Get all enrolled courses with progress for the current student with pagination (Student only).
    
    - **page**: Page number (starts at 1)
    - **limit**: Number of items per page (1-100)
    """
    return await enrollment_service.get_student_enrolled_courses(current_user.user_id, page=page, limit=limit)


@router.get(
    "/pending",
    response_model=List[Enrollment],
    summary="Get pending enrollment requests"
)
async def get_pending_enrollments(current_user: TokenData = Depends(get_current_mentor)):
    """
    Get all pending enrollment requests for courses owned by the mentor (Mentor only).
    """
    return await enrollment_service.get_mentor_pending_enrollments(current_user.user_id)


@router.get(
    "/students-count",
    response_model=int,
    summary="Get enrolled students count"
)
async def get_enrolled_students_count(current_user: TokenData = Depends(get_current_mentor)):
    """
    Get count of unique students enrolled in mentor's courses (Mentor only).
    """
    return await enrollment_service.get_mentor_enrolled_students_count(current_user.user_id)


@router.get(
    "/courses/{course_id}",
    response_model=List[Enrollment],
    summary="Get course enrollments"
)
async def get_course_enrollments(
    course_id: str,
    current_user: TokenData = Depends(get_current_mentor)
):
    """
    Get all enrollments for a course (Course owner only).
    """
    return await enrollment_service.get_course_enrollments(course_id, current_user.user_id)


@router.put(
    "/{enrollment_id}/approve",
    response_model=Enrollment,
    summary="Approve enrollment request"
)
async def approve_enrollment(
    enrollment_id: str,
    current_user: TokenData = Depends(get_current_mentor)
):
    """
    Approve an enrollment request (Course owner only).
    """
    return await enrollment_service.approve_enrollment(enrollment_id, current_user.user_id)


@router.put(
    "/{enrollment_id}/reject",
    response_model=Enrollment,
    summary="Reject enrollment request"
)
async def reject_enrollment(
    enrollment_id: str,
    current_user: TokenData = Depends(get_current_mentor)
):
    """
    Reject an enrollment request (Course owner only).
    """
    return await enrollment_service.reject_enrollment(enrollment_id, current_user.user_id)

