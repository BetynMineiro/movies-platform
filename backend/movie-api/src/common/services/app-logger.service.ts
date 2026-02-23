import { Injectable, Logger } from '@nestjs/common';
import { RequestContextService } from '../context/request-context.service';

type LogMetadata = Record<string, unknown>;

@Injectable()
export class AppLoggerService {
  private readonly logger = new Logger(AppLoggerService.name);

  constructor(private readonly requestContextService: RequestContextService) {}

  log(message: string, context?: string, metadata?: LogMetadata): void {
    this.logger.log(this.stringifyPayload(message, metadata), context);
  }

  warn(message: string, context?: string, metadata?: LogMetadata): void {
    this.logger.warn(this.stringifyPayload(message, metadata), context);
  }

  error(
    message: string,
    context?: string,
    metadata?: LogMetadata,
    stack?: string,
  ): void {
    this.logger.error(this.stringifyPayload(message, metadata), stack, context);
  }

  debug(message: string, context?: string, metadata?: LogMetadata): void {
    this.logger.debug(this.stringifyPayload(message, metadata), context);
  }

  private stringifyPayload(message: string, metadata?: LogMetadata): string {
    const traceContext = this.requestContextService.getTraceContext();

    return JSON.stringify({
      message,
      traceId: traceContext?.traceId ?? null,
      spanId: traceContext?.spanId ?? null,
      ...metadata,
    });
  }
}
