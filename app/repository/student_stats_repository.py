from typing import Optional
from datetime import datetime
from bson import ObjectId
from models.student_stats import StudentStatsInDB
from core.mongodb import get_database
from core.log_config import logger


class StudentStatsRepository:
    """Repository for student statistics database operations"""
    
    def __init__(self):
        self.collection_name = "student_stats"
    
    @property
    def collection(self):
        """Get student_stats collection - lazily fetches database"""
        db = get_database()
        return db[self.collection_name]
    
    async def get_by_student_id(self, student_id: str) -> Optional[StudentStatsInDB]:
        """Get student statistics by student ID"""
        try:
            stats = await self.collection.find_one({"student_id": student_id})
            
            if stats:
                return StudentStatsInDB(
                    _id=str(stats["_id"]),
                    student_id=stats["student_id"],
                    total_enrolled_courses=stats.get("total_enrolled_courses", 0),
                    total_approved_courses=stats.get("total_approved_courses", 0),
                    total_completed_lessons=stats.get("total_completed_lessons", 0),
                    total_available_lessons=stats.get("total_available_lessons", 0),
                    overall_progress_percentage=stats.get("overall_progress_percentage", 0.0),
                    last_updated=stats.get("last_updated", datetime.utcnow())
                )
        except Exception as e:
            logger.error(f"Error getting student stats for {student_id}: {e}")
        
        return None
    
    async def create_or_update(
        self,
        student_id: str,
        total_enrolled_courses: int,
        total_approved_courses: int,
        total_completed_lessons: int,
        total_available_lessons: int,
        overall_progress_percentage: float
    ) -> StudentStatsInDB:
        """Create or update student statistics"""
        stats_dict = {
            "student_id": student_id,
            "total_enrolled_courses": total_enrolled_courses,
            "total_approved_courses": total_approved_courses,
            "total_completed_lessons": total_completed_lessons,
            "total_available_lessons": total_available_lessons,
            "overall_progress_percentage": overall_progress_percentage,
            "last_updated": datetime.utcnow()
        }
        
        try:
            result = await self.collection.update_one(
                {"student_id": student_id},
                {"$set": stats_dict},
                upsert=True
            )
            
            # Get the updated/created document
            stats = await self.collection.find_one({"student_id": student_id})
            
            logger.info(f"Updated student stats for {student_id}")
            
            return StudentStatsInDB(
                _id=str(stats["_id"]),
                student_id=stats["student_id"],
                total_enrolled_courses=stats["total_enrolled_courses"],
                total_approved_courses=stats["total_approved_courses"],
                total_completed_lessons=stats["total_completed_lessons"],
                total_available_lessons=stats["total_available_lessons"],
                overall_progress_percentage=stats["overall_progress_percentage"],
                last_updated=stats["last_updated"]
            )
        except Exception as e:
            logger.error(f"Error creating/updating student stats for {student_id}: {e}")
            raise
    
    async def delete_by_student_id(self, student_id: str) -> bool:
        """Delete student statistics"""
        try:
            result = await self.collection.delete_one({"student_id": student_id})
            
            if result.deleted_count > 0:
                logger.info(f"Deleted student stats for {student_id}")
                return True
        except Exception as e:
            logger.error(f"Error deleting student stats for {student_id}: {e}")
        
        return False


# Create singleton instance
student_stats_repository = StudentStatsRepository()

