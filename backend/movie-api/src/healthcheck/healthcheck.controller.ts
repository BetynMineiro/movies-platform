import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import type { ApiResponse } from '../common/interfaces/api-response.interface';
import { HealthcheckService } from './healthcheck.service';

@ApiTags('healthcheck')
@Controller()
export class HealthcheckController {
  constructor(private readonly healthcheckService: HealthcheckService) {}

  @Public()
  @Get('health')
  @ApiOperation({ summary: 'API health check' })
  @ApiOkResponse({ description: 'Returns API health status.' })
  getHealthcheck(): ApiResponse<{ status: string }> {
    return this.healthcheckService.getStatus();
  }
}
