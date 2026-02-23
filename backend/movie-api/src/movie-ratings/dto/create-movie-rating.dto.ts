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
  @ApiProperty({ example: 5, minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
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
