import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { AppLoggerService } from '../services/app-logger.service';

type RequestWithTrace = Request & {
  traceContext?: {
    traceId: string;
    spanId: string;
  };
};

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly appLogger: AppLoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const startTime = Date.now();
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest<RequestWithTrace>();
    const response = httpContext.getResponse<Response>();

    const { method, originalUrl, ip } = request;
    const userAgent = request.get('user-agent') ?? 'unknown';
    const traceId = request.traceContext?.traceId ?? 'no-trace';
    const spanId = request.traceContext?.spanId ?? 'no-span';

    this.appLogger.log('[START] HTTP request', LoggingInterceptor.name, {
      method,
      originalUrl,
      ip,
      traceId,
      spanId,
      userAgent,
    });

    return next.handle().pipe(
      tap(() => {
        const durationMs = Date.now() - startTime;
        const statusCode = response.statusCode;

        const metadata = {
          method,
          originalUrl,
          statusCode,
          durationMs,
          traceId,
          spanId,
        };

        if (statusCode >= 500) {
          this.appLogger.error(
            '[END] HTTP request with server error',
            LoggingInterceptor.name,
            metadata,
          );
          return;
        }

        if (statusCode >= 400) {
          this.appLogger.warn(
            '[END] HTTP request with client error',
            LoggingInterceptor.name,
            metadata,
          );
          return;
        }

        this.appLogger.log(
          '[END] HTTP request success',
          LoggingInterceptor.name,
          metadata,
        );
      }),
      catchError((error: unknown) => {
        const durationMs = Date.now() - startTime;
        this.appLogger.error(
          '[ERROR] HTTP request failed',
          LoggingInterceptor.name,
          {
            method,
            originalUrl,
            durationMs,
            traceId,
            spanId,
          },
          error instanceof Error ? error.stack : undefined,
        );
        return throwError(() => error);
      }),
    );
  }
}
