import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PaginationMetaDto {
  @ApiPropertyOptional({ example: 10 })
  total?: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: true })
  hasNext: boolean;

  @ApiPropertyOptional({ example: 42 })
  nextCursor?: string | number;
}
