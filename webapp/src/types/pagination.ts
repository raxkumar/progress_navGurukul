export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

