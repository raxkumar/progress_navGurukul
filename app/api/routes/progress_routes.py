from fastapi import APIRouter, Depends, status
from typing import List
from models.progress import Progress, CourseProgress
from models.user import TokenData
from services.progress_service import progress_service
from core.dependencies import get_current_student, get_current_mentor

router = APIRouter()


@router.post(
    "/lessons/{lesson_id}/complete",
    response_model=Progress,
    summary="Mark lesson as complete"
)
async def mark_lesson_complete(
    lesson_id: str,
    current_user: TokenData = Depends(get_current_student)
):
    """
    Mark a lesson as complete (Enrolled student only).
    """
    return await progress_service.mark_lesson_complete(lesson_id, current_user.user_id)


@router.get(
    "/courses/{course_id}",
    response_model=CourseProgress,
    summary="Get student's course progress"
)
async def get_course_progress(
    course_id: str,
    current_user: TokenData = Depends(get_current_student)
):
    """
    Get progress for a course (Enrolled student only).
    """
    return await progress_service.get_student_course_progress(course_id, current_user.user_id)


@router.get(
    "/my-progress/{course_id}",
    response_model=List[Progress],
    summary="Get my progress for a course"
)
async def get_my_progress(
    course_id: str,
    current_user: TokenData = Depends(get_current_student)
):
    """
    Get student's own progress for a course (Student only).
    """
    return await progress_service.get_student_progress_details(course_id, current_user.user_id)


@router.get(
    "/courses/{course_id}/details",
    response_model=List[Progress],
    summary="Get detailed course progress"
)
async def get_course_progress_details(
    course_id: str,
    current_user: TokenData = Depends(get_current_student)
):
    """
    Get detailed progress for a course (Enrolled student only).
    """
    return await progress_service.get_student_progress_details(course_id, current_user.user_id)


@router.get(
    "/students/{student_id}/courses/{course_id}",
    response_model=CourseProgress,
    summary="Get student progress (Mentor view)"
)
async def get_student_progress_mentor(
    student_id: str,
    course_id: str,
    current_user: TokenData = Depends(get_current_mentor)
):
    """
    Get a student's progress for a course (Course owner only).
    """
    return await progress_service.get_mentor_student_progress(
        course_id, 
        student_id, 
        current_user.user_id
    )

