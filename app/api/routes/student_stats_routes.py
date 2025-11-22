from fastapi import APIRouter, Depends, status
from models.student_stats import StudentStats
from models.user import TokenData
from services.student_stats_service import student_stats_service
from core.dependencies import get_current_student

router = APIRouter()


@router.get(
    "/my-stats",
    response_model=StudentStats,
    summary="Get my statistics"
)
async def get_my_stats(current_user: TokenData = Depends(get_current_student)):
    """
    Get overall statistics for the current student (Student only).
    
    Returns:
    - total_enrolled_courses: Total number of enrollments
    - total_approved_courses: Number of approved enrollments
    - total_completed_lessons: Total lessons completed across all courses
    - total_available_lessons: Total lessons in all approved courses
    - overall_progress_percentage: Overall completion percentage
    """
    return await student_stats_service.get_student_stats(current_user.user_id)


@router.post(
    "/recalculate",
    response_model=dict,
    summary="Recalculate my statistics"
)
async def recalculate_my_stats(current_user: TokenData = Depends(get_current_student)):
    """
    Manually trigger recalculation of statistics (Student only).
    """
    await student_stats_service.recalculate_student_stats(current_user.user_id)
    return {"message": "Statistics recalculated successfully"}

