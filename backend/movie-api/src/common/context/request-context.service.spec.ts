import { Test, TestingModule } from '@nestjs/testing';
import {
  RequestContextService,
  type TraceContext,
} from './request-context.service';

describe('RequestContextService', () => {
  let service: RequestContextService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RequestContextService],
    }).compile();

    service = module.get<RequestContextService>(RequestContextService);
  });

  describe('run', () => {
    it('should store and retrieve trace context within callback', () => {
      const traceContext: TraceContext = {
        traceId: 'test-trace-id',
        spanId: 'test-span-id',
      };

      const result = service.run(traceContext, () => {
        const retrievedContext = service.getTraceContext();
        expect(retrievedContext).toEqual(traceContext);
        return 'test-result';
      });

      expect(result).toBe('test-result');
    });

    it('should return callback result', () => {
      const traceContext: TraceContext = {
        traceId: 'trace-1',
        spanId: 'span-1',
      };

      const result = service.run(traceContext, () => {
        return { data: 'test', value: 42 };
      });

      expect(result).toEqual({ data: 'test', value: 42 });
    });

    it('should isolate contexts between different run executions', () => {
      const context1: TraceContext = {
        traceId: 'trace-1',
        spanId: 'span-1',
      };

      const context2: TraceContext = {
        traceId: 'trace-2',
        spanId: 'span-2',
      };

      service.run(context1, () => {
        const retrieved1 = service.getTraceContext();
        expect(retrieved1).toEqual(context1);
      });

      service.run(context2, () => {
        const retrieved2 = service.getTraceContext();
        expect(retrieved2).toEqual(context2);
        expect(retrieved2).not.toEqual(context1);
      });
    });

    it('should support nested run calls with different contexts', () => {
      const outerContext: TraceContext = {
        traceId: 'outer-trace',
        spanId: 'outer-span',
      };

      const innerContext: TraceContext = {
        traceId: 'inner-trace',
        spanId: 'inner-span',
      };

      service.run(outerContext, () => {
        expect(service.getTraceContext()).toEqual(outerContext);

        service.run(innerContext, () => {
          expect(service.getTraceContext()).toEqual(innerContext);
        });

        expect(service.getTraceContext()).toEqual(outerContext);
      });
    });

    it('should propagate exceptions from callback', () => {
      const traceContext: TraceContext = {
        traceId: 'error-trace',
        spanId: 'error-span',
      };

      expect(() => {
        service.run(traceContext, () => {
          throw new Error('Test error');
        });
      }).toThrow('Test error');
    });

    it('should persist context across synchronous operations', () => {
      const traceContext: TraceContext = {
        traceId: 'sync-trace',
        spanId: 'sync-span',
      };

      service.run(traceContext, () => {
        const context1 = service.getTraceContext();
        const result = Array.from({ length: 5 }).map(() => {
          return service.getTraceContext();
        });

        result.forEach((ctx) => {
          expect(ctx).toEqual(traceContext);
        });
        expect(context1).toEqual(traceContext);
      });
    });

    it('should persist context across Promise.resolve', async () => {
      const traceContext: TraceContext = {
        traceId: 'async-trace',
        spanId: 'async-span',
      };

      await service.run(traceContext, async () => {
        const beforeAsync = service.getTraceContext();
        expect(beforeAsync).toEqual(traceContext);

        await Promise.resolve();

        const afterAsync = service.getTraceContext();
        expect(afterAsync).toEqual(traceContext);
      });
    });
  });

  describe('getTraceContext', () => {
    it('should return undefined when not inside run context', () => {
      const context = service.getTraceContext();
      expect(context).toBeUndefined();
    });

    it('should return undefined after run callback completes', () => {
      const traceContext: TraceContext = {
        traceId: 'completed-trace',
        spanId: 'completed-span',
      };

      service.run(traceContext, () => {
        expect(service.getTraceContext()).toEqual(traceContext);
      });

      const contextAfter = service.getTraceContext();
      expect(contextAfter).toBeUndefined();
    });

    it('should return current context with correct traceId and spanId', () => {
      const traceContext: TraceContext = {
        traceId: 'abc123def456',
        spanId: 'xyz789',
      };

      service.run(traceContext, () => {
        const retrieved = service.getTraceContext();
        expect(retrieved).toBeDefined();
        expect(retrieved?.traceId).toBe('abc123def456');
        expect(retrieved?.spanId).toBe('xyz789');
      });
    });
  });
});
