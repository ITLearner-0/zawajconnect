export interface PaginationCursor {
  score: number;
  userId: string;
  timestamp?: number;
}

export interface PaginationOptions {
  limit?: number;
  cursor?: PaginationCursor;
  direction?: 'forward' | 'backward';
}

export interface PaginatedResult<T> {
  data: T[];
  nextCursor?: PaginationCursor;
  prevCursor?: PaginationCursor;
  hasMore: boolean;
  totalCount?: number;
}

export interface VirtualScrollConfig {
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}
