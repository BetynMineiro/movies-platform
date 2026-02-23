import { Module } from '@nestjs/common';
import { RequestContextService } from '../common/context/request-context.service';
import { AppLoggerService } from '../common/services/app-logger.service';
import { HealthCheckController } from './healthcheck.controller';
import { HealthCheckService } from './healthcheck.service';

@Module({
  controllers: [HealthCheckController],
  providers: [HealthCheckService, RequestContextService, AppLoggerService],
})
export class HealthCheckModule {}
