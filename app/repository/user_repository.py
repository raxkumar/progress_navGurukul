from typing import Optional
from datetime import datetime
from bson import ObjectId
from models.user import UserCreate, UserInDB, UserRole
from core.mongodb import get_database
from core.log_config import logger


class UserRepository:
    """Repository for user database operations"""
    
    def __init__(self):
        self.collection_name = "users"
    
    @property
    def collection(self):
        """Get users collection - lazily fetches database"""
        db = get_database()
        return db[self.collection_name]
    
    async def create_user(self, user: UserCreate, hashed_password: str) -> UserInDB:
        """
        Create a new user in the database
        
        Args:
            user: User creation data
            hashed_password: Pre-hashed password
            
        Returns:
            Created user from database
        """
        user_dict = {
            "email": user.email,
            "role": user.role.value,
            "hashed_password": hashed_password,
            "created_at": datetime.utcnow()
        }
        
        result = await self.collection.insert_one(user_dict)
        created_user = await self.collection.find_one({"_id": result.inserted_id})
        
        logger.info(f"Created user with email: {user.email}, role: {user.role}")
        
        return UserInDB(
            _id=str(created_user["_id"]),
            email=created_user["email"],
            role=UserRole(created_user["role"]),
            hashed_password=created_user["hashed_password"],
            created_at=created_user["created_at"]
        )
    
    async def get_user_by_email(self, email: str) -> Optional[UserInDB]:
        """
        Get user by email address
        
        Args:
            email: User's email address
            
        Returns:
            User if found, None otherwise
        """
        user = await self.collection.find_one({"email": email})
        
        if user:
            return UserInDB(
                _id=str(user["_id"]),
                email=user["email"],
                role=UserRole(user["role"]),
                hashed_password=user["hashed_password"],
                created_at=user["created_at"]
            )
        return None
    
    async def get_user_by_id(self, user_id: str) -> Optional[UserInDB]:
        """
        Get user by ID
        
        Args:
            user_id: User's ID
            
        Returns:
            User if found, None otherwise
        """
        try:
            user = await self.collection.find_one({"_id": ObjectId(user_id)})
            
            if user:
                return UserInDB(
                    _id=str(user["_id"]),
                    email=user["email"],
                    role=UserRole(user["role"]),
                    hashed_password=user["hashed_password"],
                    created_at=user["created_at"]
                )
        except Exception as e:
            logger.error(f"Error getting user by ID {user_id}: {e}")
        
        return None
    
    async def email_exists(self, email: str) -> bool:
        """
        Check if email already exists in database
        
        Args:
            email: Email to check
            
        Returns:
            True if email exists, False otherwise
        """
        count = await self.collection.count_documents({"email": email})
        return count > 0


# Create a singleton instance
user_repository = UserRepository()

