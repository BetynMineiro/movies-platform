import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import type { ApiResponse } from '../common/interfaces/api-response.interface';
import { HealthCheckService } from './healthcheck.service';
import { HealthCheckResponseDto } from './dto/healthcheck-response.dto';

@ApiTags('healthcheck')
@Controller()
export class HealthCheckController {
  constructor(private readonly healthCheckService: HealthCheckService) {}

  @Public()
  @Get('health')
  @ApiOperation({ summary: 'API health check' })
  @ApiOkResponse({
    description: 'Returns API health status.',
    type: HealthCheckResponseDto,
  })
  getHealthCheck(): ApiResponse<{ status: string }> {
    return this.healthCheckService.getStatus();
  }
}
