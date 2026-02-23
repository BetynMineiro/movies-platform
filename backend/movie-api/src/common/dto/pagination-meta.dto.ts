import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PaginationMetaDto {
  @ApiPropertyOptional({ example: 10 })
  total?: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiPropertyOptional({ example: 5 })
  totalPages?: number;

  @ApiProperty({ example: false })
  hasPreviousPage: boolean;

  @ApiProperty({ example: true })
  hasNextPage: boolean;

  @ApiProperty({ example: true })
  hasNext: boolean;

  @ApiPropertyOptional({ example: 42 })
  nextCursor?: string | number;
}
