import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'node:async_hooks';

export type TraceContext = {
  traceId: string;
  spanId: string;
};

@Injectable()
export class RequestContextService {
  private readonly storage = new AsyncLocalStorage<TraceContext>();

  run<T>(traceContext: TraceContext, callback: () => T): T {
    return this.storage.run(traceContext, callback);
  }

  getTraceContext(): TraceContext | undefined {
    return this.storage.getStore();
  }
}
