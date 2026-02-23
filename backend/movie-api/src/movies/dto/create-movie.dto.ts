import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';

export class CreateMovieDto {
  @ApiProperty({ example: 'The Shawshank Redemption' })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  title: string;

  @ApiProperty({
    example: 'Two imprisoned men bond over a number of years...',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  description: string;

  @ApiProperty({ example: 1994 })
  @IsInt()
  @Min(1800)
  @Max(2100)
  releaseYear: number;

  @ApiProperty({ example: 'Drama' })
  @IsString()
  @IsNotEmpty()
  genre: string;
}
