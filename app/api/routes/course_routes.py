from fastapi import APIRouter, Depends, status
from typing import List
from models.course import CourseCreate, CourseUpdate, Course
from models.user import TokenData
from services.course_service import course_service
from core.dependencies import get_current_mentor
from core.security import get_current_user

router = APIRouter()


@router.post(
    "/",
    response_model=Course,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new course"
)
async def create_course(
    course_data: CourseCreate,
    current_user: TokenData = Depends(get_current_mentor)
):
    """
    Create a new course (Mentor only).
    
    - **title**: Course title
    - **description**: Course description
    """
    return await course_service.create_course(course_data, current_user.user_id)


@router.get(
    "/",
    response_model=List[Course],
    summary="Get all courses"
)
async def get_all_courses():
    """
    Get all available courses (public).
    """
    return await course_service.get_all_courses()


@router.get(
    "/my-courses",
    response_model=List[Course],
    summary="Get mentor's courses"
)
async def get_my_courses(current_user: TokenData = Depends(get_current_mentor)):
    """
    Get courses created by the current mentor (Mentor only).
    """
    return await course_service.get_mentor_courses(current_user.user_id)


@router.get(
    "/{course_id}",
    response_model=Course,
    summary="Get course by ID"
)
async def get_course(course_id: str):
    """
    Get course details by ID (public).
    """
    return await course_service.get_course_by_id(course_id)


@router.put(
    "/{course_id}",
    response_model=Course,
    summary="Update course"
)
async def update_course(
    course_id: str,
    course_update: CourseUpdate,
    current_user: TokenData = Depends(get_current_mentor)
):
    """
    Update a course (Owner only).
    """
    return await course_service.update_course(course_id, course_update, current_user.user_id)


@router.delete(
    "/{course_id}",
    summary="Delete course"
)
async def delete_course(
    course_id: str,
    current_user: TokenData = Depends(get_current_mentor)
):
    """
    Delete a course (Owner only).
    """
    return await course_service.delete_course(course_id, current_user.user_id)

