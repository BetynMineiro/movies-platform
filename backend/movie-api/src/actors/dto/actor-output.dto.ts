import { ApiProperty } from '@nestjs/swagger';

export class ActorOutputDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Denzel Washington' })
  name: string;

  @ApiProperty({ example: 'American' })
  nationality: string;

  @ApiProperty({ example: '2026-02-23T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-02-23T00:00:00.000Z' })
  updatedAt: Date;
}
