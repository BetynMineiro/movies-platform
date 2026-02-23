import { Injectable } from '@nestjs/common';
import { ApiResponse } from '../common/interfaces/api-response.interface';
import { AppLoggerService } from '../common/services/app-logger.service';

@Injectable()
export class HealthCheckService {
  constructor(private readonly appLogger: AppLoggerService) {}

  getStatus(): ApiResponse<{ status: string }> {
    this.appLogger.log('HealthCheck requested', HealthCheckService.name);

    return {
      data: {
        status: 'ok',
      },
    };
  }
}
