from fastapi import APIRouter, Depends, status
from typing import List
from models.lesson import LessonCreate, LessonUpdate, Lesson
from models.user import TokenData
from services.lesson_service import lesson_service
from core.dependencies import get_current_mentor
from core.security import get_current_user

router = APIRouter()


@router.post(
    "/courses/{course_id}/lessons",
    response_model=Lesson,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new lesson"
)
async def create_lesson(
    course_id: str,
    lesson_data: LessonCreate,
    current_user: TokenData = Depends(get_current_mentor)
):
    """
    Create a new lesson in a course (Course owner only).
    
    - **title**: Lesson title
    - **description**: Lesson description
    - **type**: Lesson type (PDF, VIDEO, PPT, etc.)
    - **order**: Lesson order in the course
    - **duration**: Lesson duration in minutes (optional)
    """
    return await lesson_service.create_lesson(course_id, lesson_data, current_user.user_id)


@router.get(
    "/courses/{course_id}/lessons",
    response_model=List[Lesson],
    summary="Get lessons for a course"
)
async def get_course_lessons(course_id: str):
    """
    Get all lessons for a course (public).
    """
    return await lesson_service.get_lessons_by_course(course_id)


@router.get(
    "/lessons/{lesson_id}",
    response_model=Lesson,
    summary="Get lesson by ID"
)
async def get_lesson(lesson_id: str):
    """
    Get lesson details by ID (public).
    """
    return await lesson_service.get_lesson_by_id(lesson_id)


@router.put(
    "/lessons/{lesson_id}",
    response_model=Lesson,
    summary="Update lesson"
)
async def update_lesson(
    lesson_id: str,
    lesson_update: LessonUpdate,
    current_user: TokenData = Depends(get_current_mentor)
):
    """
    Update a lesson (Course owner only).
    """
    return await lesson_service.update_lesson(lesson_id, lesson_update, current_user.user_id)


@router.delete(
    "/lessons/{lesson_id}",
    summary="Delete lesson"
)
async def delete_lesson(
    lesson_id: str,
    current_user: TokenData = Depends(get_current_mentor)
):
    """
    Delete a lesson (Course owner only).
    """
    return await lesson_service.delete_lesson(lesson_id, current_user.user_id)

