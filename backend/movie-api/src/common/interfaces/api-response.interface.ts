export interface ApiResponse<T> {
  data: T;
  meta?: {
    total?: number;
    limit?: number;
    totalPages?: number;
    hasPreviousPage?: boolean;
    hasNextPage?: boolean;
    hasNext?: boolean;
    nextCursor?: string | number;
  };
}
