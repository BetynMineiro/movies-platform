import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MovieRatingOutputDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 5 })
  score: number;

  @ApiPropertyOptional({ example: 'Excellent movie with great acting.' })
  comment?: string;

  @ApiProperty({ example: 10 })
  movieId: number;

  @ApiProperty({ example: '2026-02-23T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-02-23T00:00:00.000Z' })
  updatedAt: Date;
}
