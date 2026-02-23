import { Module } from '@nestjs/common';
import { RequestContextService } from '../common/context/request-context.service';
import { AppLoggerService } from '../common/services/app-logger.service';
import { HealthcheckController } from './healthcheck.controller';
import { HealthcheckService } from './healthcheck.service';

@Module({
  controllers: [HealthcheckController],
  providers: [HealthcheckService, RequestContextService, AppLoggerService],
})
export class HealthcheckModule {}
