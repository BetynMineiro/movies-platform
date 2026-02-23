import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';

export class CreateMovieRatingDto {
  @ApiProperty({ example: 7, minimum: 0, maximum: 10 })
  @IsInt()
  @Min(0)
  @Max(10)
  score: number;

  @ApiProperty({
    required: false,
    example: 'Excellent movie with great acting.',
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  comment?: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  movieId: number;
}
