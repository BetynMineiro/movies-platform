export interface ApiResponse<T> {
  data: T;
  meta?: {
    total?: number;
    limit?: number;
    hasNext?: boolean;
    nextCursor?: number;
  };
}
