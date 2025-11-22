from typing import Optional
from fastapi import HTTPException, status
from models.user import UserCreate, UserLogin, User, TokenResponse, UserInDB
from repository.user_repository import user_repository
from core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    verify_token
)
from core.log_config import logger


class AuthService:
    """Service for authentication business logic"""
    
    async def register_user(self, user_data: UserCreate) -> TokenResponse:
        """
        Register a new user
        
        Args:
            user_data: User registration data
            
        Returns:
            Token response with access token, refresh token, and user info
            
        Raises:
            HTTPException: If email already exists
        """
        # Check if email already exists
        if await user_repository.email_exists(user_data.email):
            logger.warning(f"Registration attempt with existing email: {user_data.email}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Hash the password
        hashed_password = hash_password(user_data.password)
        
        # Create user in database
        user_in_db = await user_repository.create_user(user_data, hashed_password)
        
        # Generate tokens
        token_data = {
            "user_id": user_in_db.id,
            "email": user_in_db.email,
            "role": user_in_db.role.value
        }
        
        access_token = create_access_token(token_data)
        refresh_token = create_refresh_token(token_data)
        
        # Create user response
        user_response = User(
            _id=user_in_db.id,
            email=user_in_db.email,
            role=user_in_db.role,
            created_at=user_in_db.created_at
        )
        
        logger.info(f"User registered successfully: {user_in_db.email}")
        
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            user=user_response
        )
    
    async def authenticate_user(self, login_data: UserLogin) -> TokenResponse:
        """
        Authenticate a user and generate tokens
        
        Args:
            login_data: User login credentials
            
        Returns:
            Token response with access token, refresh token, and user info
            
        Raises:
            HTTPException: If credentials are invalid
        """
        # Get user by email
        user_in_db = await user_repository.get_user_by_email(login_data.email)
        
        if not user_in_db:
            logger.warning(f"Login attempt with non-existent email: {login_data.email}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        # Verify password
        if not verify_password(login_data.password, user_in_db.hashed_password):
            logger.warning(f"Failed login attempt for email: {login_data.email}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        # Verify role matches
        if user_in_db.role != login_data.role:
            logger.warning(
                f"Role mismatch for {login_data.email}. "
                f"Attempted: {login_data.role}, Actual: {user_in_db.role}"
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"User is not registered as a {login_data.role.value}"
            )
        
        # Generate tokens
        token_data = {
            "user_id": user_in_db.id,
            "email": user_in_db.email,
            "role": user_in_db.role.value
        }
        
        access_token = create_access_token(token_data)
        refresh_token = create_refresh_token(token_data)
        
        # Create user response
        user_response = User(
            _id=user_in_db.id,
            email=user_in_db.email,
            role=user_in_db.role,
            created_at=user_in_db.created_at
        )
        
        logger.info(f"User logged in successfully: {user_in_db.email} as {user_in_db.role}")
        
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            user=user_response
        )
    
    async def refresh_access_token(self, refresh_token: str) -> dict:
        """
        Generate new access token using refresh token
        
        Args:
            refresh_token: Valid refresh token
            
        Returns:
            Dictionary with new access token
            
        Raises:
            HTTPException: If refresh token is invalid
        """
        # Verify refresh token
        token_data = verify_token(refresh_token, token_type="refresh")
        
        # Verify user still exists
        user_in_db = await user_repository.get_user_by_id(token_data.user_id)
        
        if not user_in_db:
            logger.error(f"Refresh token for non-existent user: {token_data.user_id}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )
        
        # Generate new access token
        new_token_data = {
            "user_id": user_in_db.id,
            "email": user_in_db.email,
            "role": user_in_db.role.value
        }
        
        new_access_token = create_access_token(new_token_data)
        
        logger.info(f"Access token refreshed for user: {user_in_db.email}")
        
        return {
            "access_token": new_access_token,
            "token_type": "bearer"
        }
    
    async def get_user_info(self, user_id: str) -> User:
        """
        Get user information by ID
        
        Args:
            user_id: User's ID
            
        Returns:
            User information
            
        Raises:
            HTTPException: If user not found
        """
        user_in_db = await user_repository.get_user_by_id(user_id)
        
        if not user_in_db:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return User(
            _id=user_in_db.id,
            email=user_in_db.email,
            role=user_in_db.role,
            created_at=user_in_db.created_at
        )


# Create singleton instance
auth_service = AuthService()

