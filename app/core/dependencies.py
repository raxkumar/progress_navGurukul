from fastapi import Depends
from models.user import TokenData, UserRole
from core.security import get_current_user, get_current_user_with_role


async def get_current_student(
    current_user: TokenData = Depends(get_current_user)
) -> TokenData:
    """
    Dependency to verify current user is a STUDENT
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        TokenData if user is a student
        
    Raises:
        HTTPException: If user is not a student
    """
    return await get_current_user_with_role(UserRole.STUDENT, current_user)


async def get_current_mentor(
    current_user: TokenData = Depends(get_current_user)
) -> TokenData:
    """
    Dependency to verify current user is a MENTOR
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        TokenData if user is a mentor
        
    Raises:
        HTTPException: If user is not a mentor
    """
    return await get_current_user_with_role(UserRole.MENTOR, current_user)

