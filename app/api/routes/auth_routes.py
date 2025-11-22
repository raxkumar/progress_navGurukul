from fastapi import APIRouter, Depends, status
from models.user import UserCreate, UserLogin, TokenResponse, RefreshTokenRequest, User
from services.auth_service import auth_service
from core.security import get_current_user
from models.user import TokenData

router = APIRouter()


@router.post(
    "/signup",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user"
)
async def signup(user_data: UserCreate):
    """
    Register a new user account.
    
    - **email**: Valid email address
    - **password**: Password (minimum 6 characters)
    - **role**: User role (STUDENT or MENTOR)
    
    Returns access token, refresh token, and user information.
    """
    return await auth_service.register_user(user_data)


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Login user"
)
async def login(login_data: UserLogin):
    """
    Authenticate user and return tokens.
    
    - **email**: User's email address
    - **password**: User's password
    - **role**: Role user is logging in as (STUDENT or MENTOR)
    
    Returns access token, refresh token, and user information.
    """
    return await auth_service.authenticate_user(login_data)


@router.post(
    "/refresh",
    summary="Refresh access token"
)
async def refresh_token(refresh_data: RefreshTokenRequest):
    """
    Generate a new access token using a valid refresh token.
    
    - **refresh_token**: Valid refresh token
    
    Returns new access token.
    """
    return await auth_service.refresh_access_token(refresh_data.refresh_token)


@router.get(
    "/me",
    response_model=User,
    summary="Get current user info"
)
async def get_current_user_info(current_user: TokenData = Depends(get_current_user)):
    """
    Get information about the currently authenticated user.
    
    Requires valid access token in Authorization header.
    
    Returns user information including email, role, and creation date.
    """
    return await auth_service.get_user_info(current_user.user_id)

