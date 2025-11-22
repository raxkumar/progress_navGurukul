from fastapi import APIRouter, Depends, status, Query
from typing import List
from models.course import CourseCreate, CourseUpdate, Course
from models.pagination import PaginatedResponse
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
    response_model=PaginatedResponse[Course],
    summary="Get all courses"
)
async def get_all_courses(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=100, description="Items per page")
):
    """
    Get all available courses with pagination (public).
    
    - **page**: Page number (starts at 1)
    - **limit**: Number of items per page (1-100)
    """
    return await course_service.get_all_courses(page=page, limit=limit)


@router.get(
    "/my-courses",
    response_model=PaginatedResponse[Course],
    summary="Get mentor's courses"
)
async def get_my_courses(
    current_user: TokenData = Depends(get_current_mentor),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=100, description="Items per page")
):
    """
    Get courses created by the current mentor with pagination (Mentor only).
    
    - **page**: Page number (starts at 1)
    - **limit**: Number of items per page (1-100)
    """
    return await course_service.get_mentor_courses(current_user.user_id, page=page, limit=limit)


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

