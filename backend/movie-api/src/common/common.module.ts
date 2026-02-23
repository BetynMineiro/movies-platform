import { Global, Module } from '@nestjs/common';
import { AppLoggerService } from './services/app-logger.service';
import { RequestContextService } from './context/request-context.service';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { TracingInterceptor } from './interceptors/tracing.interceptor';

@Global()
@Module({
  providers: [
    AppLoggerService,
    RequestContextService,
    LoggingInterceptor,
    TracingInterceptor,
  ],
  exports: [
    AppLoggerService,
    RequestContextService,
    LoggingInterceptor,
    TracingInterceptor,
  ],
})
export class CommonModule {}
