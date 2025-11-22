from typing import TypeVar, Generic, List
from pydantic import BaseModel, Field

T = TypeVar('T')


class PaginationParams(BaseModel):
    """Pagination parameters for API requests"""
    page: int = Field(default=1, ge=1, description="Page number (starts at 1)")
    limit: int = Field(default=10, ge=1, le=100, description="Items per page")
    
    @property
    def skip(self) -> int:
        """Calculate skip value for database query"""
        return (self.page - 1) * self.limit


class PaginatedResponse(BaseModel, Generic[T]):
    """Generic paginated response model"""
    items: List[T]
    total: int
    page: int
    limit: int
    total_pages: int
    has_next: bool
    has_prev: bool
    
    @classmethod
    def create(cls, items: List[T], total: int, page: int, limit: int):
        """Create paginated response with calculated fields"""
        total_pages = (total + limit - 1) // limit  # Ceiling division
        return cls(
            items=items,
            total=total,
            page=page,
            limit=limit,
            total_pages=total_pages,
            has_next=page < total_pages,
            has_prev=page > 1
        )

