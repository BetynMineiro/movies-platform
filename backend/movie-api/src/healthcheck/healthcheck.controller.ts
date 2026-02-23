import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { HealthcheckService } from './healthcheck.service';

@ApiTags('healthcheck')
@Controller()
export class HealthcheckController {
  constructor(private readonly healthcheckService: HealthcheckService) {}

  @Get()
  @ApiOperation({ summary: 'Default API health check' })
  @ApiOkResponse({ description: 'Returns API health status.' })
  getDefaultHealthcheck(): { status: string } {
    return this.healthcheckService.getStatus();
  }

  @Get('health')
  @ApiOperation({ summary: 'API health check' })
  @ApiOkResponse({ description: 'Returns API health status.' })
  getHealthcheck(): { status: string } {
    return this.healthcheckService.getStatus();
  }
}
