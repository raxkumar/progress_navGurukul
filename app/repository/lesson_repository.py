from typing import Optional, List
from datetime import datetime
from bson import ObjectId
from models.lesson import LessonCreate, LessonUpdate, LessonInDB
from core.mongodb import get_database
from core.log_config import logger


class LessonRepository:
    """Repository for lesson database operations"""
    
    def __init__(self):
        self.collection_name = "lessons"
    
    @property
    def collection(self):
        """Get lessons collection - lazily fetches database"""
        db = get_database()
        return db[self.collection_name]
    
    async def create_lesson(self, lesson: LessonCreate, course_id: str) -> LessonInDB:
        """Create a new lesson"""
        lesson_dict = {
            "course_id": course_id,
            "title": lesson.title,
            "description": lesson.description,
            "type": lesson.type.value,
            "order": lesson.order,
            "duration": lesson.duration,
            "created_at": datetime.utcnow()
        }
        
        result = await self.collection.insert_one(lesson_dict)
        created_lesson = await self.collection.find_one({"_id": result.inserted_id})
        
        logger.info(f"Created lesson: {lesson.title} for course: {course_id}")
        
        return LessonInDB(
            _id=str(created_lesson["_id"]),
            course_id=created_lesson["course_id"],
            title=created_lesson["title"],
            description=created_lesson["description"],
            type=created_lesson["type"],
            order=created_lesson["order"],
            duration=created_lesson.get("duration"),
            created_at=created_lesson["created_at"]
        )
    
    async def get_lessons_by_course(self, course_id: str) -> List[LessonInDB]:
        """Get all lessons for a course"""
        lessons = []
        cursor = self.collection.find({"course_id": course_id}).sort("order", 1)
        
        async for lesson in cursor:
            lessons.append(LessonInDB(
                _id=str(lesson["_id"]),
                course_id=lesson["course_id"],
                title=lesson["title"],
                description=lesson["description"],
                type=lesson["type"],
                order=lesson["order"],
                duration=lesson.get("duration"),
                created_at=lesson["created_at"]
            ))
        
        return lessons
    
    async def get_lesson_by_id(self, lesson_id: str) -> Optional[LessonInDB]:
        """Get lesson by ID"""
        try:
            lesson = await self.collection.find_one({"_id": ObjectId(lesson_id)})
            
            if lesson:
                return LessonInDB(
                    _id=str(lesson["_id"]),
                    course_id=lesson["course_id"],
                    title=lesson["title"],
                    description=lesson["description"],
                    type=lesson["type"],
                    order=lesson["order"],
                    duration=lesson.get("duration"),
                    created_at=lesson["created_at"]
                )
        except Exception as e:
            logger.error(f"Error getting lesson by ID {lesson_id}: {e}")
        
        return None
    
    async def update_lesson(self, lesson_id: str, lesson_update: LessonUpdate) -> Optional[LessonInDB]:
        """Update lesson"""
        update_dict = {}
        if lesson_update.title is not None:
            update_dict["title"] = lesson_update.title
        if lesson_update.description is not None:
            update_dict["description"] = lesson_update.description
        if lesson_update.type is not None:
            update_dict["type"] = lesson_update.type.value
        if lesson_update.order is not None:
            update_dict["order"] = lesson_update.order
        if lesson_update.duration is not None:
            update_dict["duration"] = lesson_update.duration
        
        if not update_dict:
            return await self.get_lesson_by_id(lesson_id)
        
        try:
            result = await self.collection.update_one(
                {"_id": ObjectId(lesson_id)},
                {"$set": update_dict}
            )
            
            if result.modified_count > 0:
                logger.info(f"Updated lesson: {lesson_id}")
                return await self.get_lesson_by_id(lesson_id)
        except Exception as e:
            logger.error(f"Error updating lesson {lesson_id}: {e}")
        
        return None
    
    async def delete_lesson(self, lesson_id: str) -> bool:
        """Delete lesson"""
        try:
            result = await self.collection.delete_one({"_id": ObjectId(lesson_id)})
            
            if result.deleted_count > 0:
                logger.info(f"Deleted lesson: {lesson_id}")
                return True
        except Exception as e:
            logger.error(f"Error deleting lesson {lesson_id}: {e}")
        
        return False
    
    async def delete_lessons_by_course(self, course_id: str) -> int:
        """Delete all lessons for a course"""
        try:
            result = await self.collection.delete_many({"course_id": course_id})
            logger.info(f"Deleted {result.deleted_count} lessons for course: {course_id}")
            return result.deleted_count
        except Exception as e:
            logger.error(f"Error deleting lessons for course {course_id}: {e}")
            return 0


# Create singleton instance
lesson_repository = LessonRepository()

