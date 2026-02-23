import { Module } from '@nestjs/common';
import { RequestContextService } from './common/context/request-context.service';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TracingInterceptor } from './common/interceptors/tracing.interceptor';
import { AppLoggerService } from './common/services/app-logger.service';
import { HealthcheckModule } from './healthcheck/healthcheck.module';

@Module({
  imports: [HealthcheckModule],
  providers: [
    RequestContextService,
    AppLoggerService,
    TracingInterceptor,
    LoggingInterceptor,
  ],
})
export class AppModule {}
