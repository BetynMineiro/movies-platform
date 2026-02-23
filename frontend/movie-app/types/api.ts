
export interface MovieDto {
  id: number;
  title: string;
  description: string;
  releaseYear: number;
  genre: string;
  createdAt: string;
  updatedAt: string;
}

export interface ActorDto {
  id: number;
  name: string;
  nationality: string;
  createdAt: string;
  updatedAt: string;
}

export interface RatingDto {
  id: number;
  rating: number;
  review: string;
  userId: number;
  movieId: number;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta?: {
    total?: number;
    limit?: number;
    totalPages?: number;
    hasPreviousPage?: boolean;
    hasNextPage?: boolean;
    hasNext?: boolean;
    nextCursor?: number | string;
  };
}

export interface CreateMovieDto {
  title: string;
  description: string;
  releaseYear: number;
  genre: string;
}

export type UpdateMovieDto = Partial<CreateMovieDto>;

export interface CreateActorDto {
  name: string;
  nationality: string;
}

export type UpdateActorDto = Partial<CreateActorDto>;

export interface CreateRatingDto {
  rating: number;
  review: string;
  movieId: number;
}
