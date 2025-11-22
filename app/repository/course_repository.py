from typing import Optional, List, Tuple
from datetime import datetime
from bson import ObjectId
from models.course import CourseCreate, CourseUpdate, CourseInDB
from core.mongodb import get_database
from core.log_config import logger


class CourseRepository:
    """Repository for course database operations"""
    
    def __init__(self):
        self.collection_name = "courses"
    
    @property
    def collection(self):
        """Get courses collection - lazily fetches database"""
        db = get_database()
        return db[self.collection_name]
    
    async def create_course(self, course: CourseCreate, mentor_id: str) -> CourseInDB:
        """Create a new course"""
        course_dict = {
            "title": course.title,
            "description": course.description,
            "mentor_id": mentor_id,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        result = await self.collection.insert_one(course_dict)
        created_course = await self.collection.find_one({"_id": result.inserted_id})
        
        logger.info(f"Created course: {course.title} by mentor: {mentor_id}")
        
        return CourseInDB(
            _id=str(created_course["_id"]),
            title=created_course["title"],
            description=created_course["description"],
            mentor_id=created_course["mentor_id"],
            created_at=created_course["created_at"],
            updated_at=created_course["updated_at"]
        )
    
    async def get_course_by_id(self, course_id: str) -> Optional[CourseInDB]:
        """Get course by ID"""
        try:
            course = await self.collection.find_one({"_id": ObjectId(course_id)})
            
            if course:
                return CourseInDB(
                    _id=str(course["_id"]),
                    title=course["title"],
                    description=course["description"],
                    mentor_id=course["mentor_id"],
                    created_at=course["created_at"],
                    updated_at=course["updated_at"]
                )
        except Exception as e:
            logger.error(f"Error getting course by ID {course_id}: {e}")
        
        return None
    
    async def get_courses_by_mentor(self, mentor_id: str, skip: int = 0, limit: int = 10) -> Tuple[List[CourseInDB], int]:
        """Get courses by a mentor with pagination
        
        Returns:
            Tuple of (courses list, total count)
        """
        query = {"mentor_id": mentor_id}
        
        # Get total count
        total = await self.collection.count_documents(query)
        
        # Get paginated courses
        courses = []
        cursor = self.collection.find(query).sort("created_at", -1).skip(skip).limit(limit)
        
        async for course in cursor:
            courses.append(CourseInDB(
                _id=str(course["_id"]),
                title=course["title"],
                description=course["description"],
                mentor_id=course["mentor_id"],
                created_at=course["created_at"],
                updated_at=course["updated_at"]
            ))
        
        return courses, total
    
    async def get_all_courses(self, skip: int = 0, limit: int = 10) -> Tuple[List[CourseInDB], int]:
        """Get all courses with pagination
        
        Returns:
            Tuple of (courses list, total count)
        """
        query = {}
        
        # Get total count
        total = await self.collection.count_documents(query)
        
        # Get paginated courses
        courses = []
        cursor = self.collection.find(query).sort("created_at", -1).skip(skip).limit(limit)
        
        async for course in cursor:
            courses.append(CourseInDB(
                _id=str(course["_id"]),
                title=course["title"],
                description=course["description"],
                mentor_id=course["mentor_id"],
                created_at=course["created_at"],
                updated_at=course["updated_at"]
            ))
        
        return courses, total
    
    async def update_course(self, course_id: str, course_update: CourseUpdate) -> Optional[CourseInDB]:
        """Update course"""
        update_dict = {}
        if course_update.title is not None:
            update_dict["title"] = course_update.title
        if course_update.description is not None:
            update_dict["description"] = course_update.description
        
        if not update_dict:
            return await self.get_course_by_id(course_id)
        
        update_dict["updated_at"] = datetime.utcnow()
        
        try:
            result = await self.collection.update_one(
                {"_id": ObjectId(course_id)},
                {"$set": update_dict}
            )
            
            if result.modified_count > 0:
                logger.info(f"Updated course: {course_id}")
                return await self.get_course_by_id(course_id)
        except Exception as e:
            logger.error(f"Error updating course {course_id}: {e}")
        
        return None
    
    async def delete_course(self, course_id: str) -> bool:
        """Delete course"""
        try:
            result = await self.collection.delete_one({"_id": ObjectId(course_id)})
            
            if result.deleted_count > 0:
                logger.info(f"Deleted course: {course_id}")
                return True
        except Exception as e:
            logger.error(f"Error deleting course {course_id}: {e}")
        
        return False


# Create singleton instance
course_repository = CourseRepository()

