from fastapi import APIRouter
from api.routes import (
    management_routes,
    common_routes,
    auth_routes,
    course_routes,
    lesson_routes,
    enrollment_routes,
    progress_routes,
    student_stats_routes,
)

api_router = APIRouter()

api_router.include_router(auth_routes.router, prefix="/auth", tags=["authentication"])
api_router.include_router(course_routes.router, prefix="/courses", tags=["courses"])
api_router.include_router(lesson_routes.router, prefix="", tags=["lessons"])
api_router.include_router(enrollment_routes.router, prefix="/enrollments", tags=["enrollments"])
api_router.include_router(progress_routes.router, prefix="/progress", tags=["progress"])
api_router.include_router(student_stats_routes.router, prefix="/student-stats", tags=["student-statistics"])
api_router.include_router(management_routes.router, tags=["management-endpoints"])
api_router.include_router(common_routes.router, tags=["common-endpoints"])
