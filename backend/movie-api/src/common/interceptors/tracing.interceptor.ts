import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import type { Request, Response } from 'express';
import { Observable } from 'rxjs';
import {
  RequestContextService,
  type TraceContext,
} from '../context/request-context.service';

type RequestWithTrace = Request & {
  traceContext?: TraceContext;
};

@Injectable()
export class TracingInterceptor implements NestInterceptor {
  constructor(private readonly requestContextService: RequestContextService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest<RequestWithTrace>();
    const response = httpContext.getResponse<Response>();

    const traceId = this.resolveTraceId(request.headers['x-trace-id']);
    const spanId = this.createSpanId();

    request.traceContext = { traceId, spanId };

    response.setHeader('x-trace-id', traceId);
    response.setHeader('x-span-id', spanId);

    return this.requestContextService.run({ traceId, spanId }, () =>
      next.handle(),
    );
  }

  private resolveTraceId(rawTraceId: string | string[] | undefined): string {
    const traceId = Array.isArray(rawTraceId) ? rawTraceId[0] : rawTraceId;

    if (traceId && /^[a-f0-9]{32}$/i.test(traceId)) {
      return traceId.toLowerCase();
    }

    return randomBytes(16).toString('hex');
  }

  private createSpanId(): string {
    return randomBytes(8).toString('hex');
  }
}
