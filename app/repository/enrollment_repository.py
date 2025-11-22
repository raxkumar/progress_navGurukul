from typing import Optional, List
from datetime import datetime
from bson import ObjectId
from models.enrollment import EnrollmentCreate, EnrollmentStatus, EnrollmentInDB
from core.mongodb import get_database
from core.log_config import logger


class EnrollmentRepository:
    """Repository for enrollment database operations"""
    
    def __init__(self):
        self.collection_name = "enrollments"
    
    @property
    def collection(self):
        """Get enrollments collection - lazily fetches database"""
        db = get_database()
        return db[self.collection_name]
    
    async def create_enrollment_request(self, enrollment: EnrollmentCreate, student_id: str) -> EnrollmentInDB:
        """Create a new enrollment request"""
        enrollment_dict = {
            "student_id": student_id,
            "course_id": enrollment.course_id,
            "status": EnrollmentStatus.PENDING.value,
            "requested_at": datetime.utcnow(),
            "approved_at": None,
            "approved_by": None
        }
        
        result = await self.collection.insert_one(enrollment_dict)
        created_enrollment = await self.collection.find_one({"_id": result.inserted_id})
        
        logger.info(f"Created enrollment request: student {student_id} for course {enrollment.course_id}")
        
        return EnrollmentInDB(
            _id=str(created_enrollment["_id"]),
            student_id=created_enrollment["student_id"],
            course_id=created_enrollment["course_id"],
            status=EnrollmentStatus(created_enrollment["status"]),
            requested_at=created_enrollment["requested_at"],
            approved_at=created_enrollment.get("approved_at"),
            approved_by=created_enrollment.get("approved_by")
        )
    
    async def get_enrollments_by_student(self, student_id: str) -> List[EnrollmentInDB]:
        """Get all enrollments for a student"""
        enrollments = []
        cursor = self.collection.find({"student_id": student_id}).sort("requested_at", -1)
        
        async for enrollment in cursor:
            enrollments.append(EnrollmentInDB(
                _id=str(enrollment["_id"]),
                student_id=enrollment["student_id"],
                course_id=enrollment["course_id"],
                status=EnrollmentStatus(enrollment["status"]),
                requested_at=enrollment["requested_at"],
                approved_at=enrollment.get("approved_at"),
                approved_by=enrollment.get("approved_by")
            ))
        
        return enrollments
    
    async def get_enrollments_by_course(self, course_id: str) -> List[EnrollmentInDB]:
        """Get all enrollments for a course"""
        enrollments = []
        cursor = self.collection.find({"course_id": course_id}).sort("requested_at", -1)
        
        async for enrollment in cursor:
            enrollments.append(EnrollmentInDB(
                _id=str(enrollment["_id"]),
                student_id=enrollment["student_id"],
                course_id=enrollment["course_id"],
                status=EnrollmentStatus(enrollment["status"]),
                requested_at=enrollment["requested_at"],
                approved_at=enrollment.get("approved_at"),
                approved_by=enrollment.get("approved_by")
            ))
        
        return enrollments
    
    async def get_enrollment_by_id(self, enrollment_id: str) -> Optional[EnrollmentInDB]:
        """Get enrollment by ID"""
        try:
            enrollment = await self.collection.find_one({"_id": ObjectId(enrollment_id)})
            
            if enrollment:
                return EnrollmentInDB(
                    _id=str(enrollment["_id"]),
                    student_id=enrollment["student_id"],
                    course_id=enrollment["course_id"],
                    status=EnrollmentStatus(enrollment["status"]),
                    requested_at=enrollment["requested_at"],
                    approved_at=enrollment.get("approved_at"),
                    approved_by=enrollment.get("approved_by")
                )
        except Exception as e:
            logger.error(f"Error getting enrollment by ID {enrollment_id}: {e}")
        
        return None
    
    async def update_enrollment_status(
        self, 
        enrollment_id: str, 
        status: EnrollmentStatus, 
        approved_by: Optional[str] = None
    ) -> Optional[EnrollmentInDB]:
        """Update enrollment status"""
        update_dict = {
            "status": status.value
        }
        
        if status in [EnrollmentStatus.APPROVED, EnrollmentStatus.REJECTED]:
            update_dict["approved_at"] = datetime.utcnow()
            if approved_by:
                update_dict["approved_by"] = approved_by
        
        try:
            result = await self.collection.update_one(
                {"_id": ObjectId(enrollment_id)},
                {"$set": update_dict}
            )
            
            if result.modified_count > 0:
                logger.info(f"Updated enrollment {enrollment_id} status to {status.value}")
                return await self.get_enrollment_by_id(enrollment_id)
        except Exception as e:
            logger.error(f"Error updating enrollment {enrollment_id}: {e}")
        
        return None
    
    async def check_enrollment_exists(self, student_id: str, course_id: str) -> Optional[EnrollmentInDB]:
        """Check if enrollment exists for student and course"""
        enrollment = await self.collection.find_one({
            "student_id": student_id,
            "course_id": course_id
        })
        
        if enrollment:
            return EnrollmentInDB(
                _id=str(enrollment["_id"]),
                student_id=enrollment["student_id"],
                course_id=enrollment["course_id"],
                status=EnrollmentStatus(enrollment["status"]),
                requested_at=enrollment["requested_at"],
                approved_at=enrollment.get("approved_at"),
                approved_by=enrollment.get("approved_by")
            )
        
        return None


# Create singleton instance
enrollment_repository = EnrollmentRepository()

