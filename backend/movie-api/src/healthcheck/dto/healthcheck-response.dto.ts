import { ApiProperty } from '@nestjs/swagger';

class HealthStatusDto {
  @ApiProperty({ example: 'ok' })
  status: string;
}

export class HealthCheckResponseDto {
  @ApiProperty({ type: HealthStatusDto })
  data: HealthStatusDto;
}
