import { ApiProperty } from '@nestjs/swagger';

export class MovieOutputDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'The Matrix' })
  title: string;

  @ApiProperty({
    example: 'A computer hacker learns about the true nature of reality.',
  })
  description: string;

  @ApiProperty({ example: 1999 })
  releaseYear: number;

  @ApiProperty({ example: 'Sci-Fi' })
  genre: string;

  @ApiProperty({ example: '2026-02-23T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-02-23T00:00:00.000Z' })
  updatedAt: Date;
}
