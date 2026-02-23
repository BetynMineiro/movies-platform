import { ExecutionContext, CallHandler } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { of } from 'rxjs';
import { RequestContextService } from '../context/request-context.service';
import { TracingInterceptor } from './tracing.interceptor';

describe('TracingInterceptor', () => {
  let interceptor: TracingInterceptor;
  let requestContextService: RequestContextService;

  const mockRequest = {
    headers: {},
    traceContext: undefined,
  };

  const mockResponse = {
    setHeader: jest.fn(),
  };

  const mockExecutionContext = {
    switchToHttp: jest.fn().mockReturnValue({
      getRequest: jest.fn().mockReturnValue(mockRequest),
      getResponse: jest.fn().mockReturnValue(mockResponse),
    }),
  } as unknown as ExecutionContext;

  const mockCallHandler: CallHandler = {
    handle: jest.fn().mockReturnValue(of('test')),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TracingInterceptor, RequestContextService],
    }).compile();

    interceptor = module.get<TracingInterceptor>(TracingInterceptor);
    requestContextService = module.get<RequestContextService>(
      RequestContextService,
    );

    mockRequest.headers = {};
    mockRequest.traceContext = undefined;
    mockResponse.setHeader.mockClear();
    (mockCallHandler.handle as jest.Mock).mockClear();
  });

  describe('intercept', () => {
    it('should generate new traceId and spanId when no x-trace-id header provided', (done) => {
      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: () => {
          expect(mockRequest.traceContext).toBeDefined();
          expect(mockRequest.traceContext?.traceId).toMatch(/^[a-f0-9]{32}$/);
          expect(mockRequest.traceContext?.spanId).toMatch(/^[a-f0-9]{16}$/);
          expect(mockResponse.setHeader).toHaveBeenCalledWith(
            'x-trace-id',
            expect.stringMatching(/^[a-f0-9]{32}$/),
          );
          expect(mockResponse.setHeader).toHaveBeenCalledWith(
            'x-span-id',
            expect.stringMatching(/^[a-f0-9]{16}$/),
          );
          done();
        },
      });
    });

    it('should reuse valid traceId from x-trace-id header', (done) => {
      const validTraceId = 'a'.repeat(32);
      mockRequest.headers['x-trace-id'] = validTraceId;

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: () => {
          expect(mockRequest.traceContext?.traceId).toBe(validTraceId);
          expect(mockResponse.setHeader).toHaveBeenCalledWith(
            'x-trace-id',
            validTraceId,
          );
          done();
        },
      });
    });

    it('should normalize uppercase traceId to lowercase', (done) => {
      const uppercaseTraceId = 'A'.repeat(32);
      mockRequest.headers['x-trace-id'] = uppercaseTraceId;

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: () => {
          expect(mockRequest.traceContext?.traceId).toBe(
            uppercaseTraceId.toLowerCase(),
          );
          expect(mockResponse.setHeader).toHaveBeenCalledWith(
            'x-trace-id',
            uppercaseTraceId.toLowerCase(),
          );
          done();
        },
      });
    });

    it('should generate new traceId when header value is invalid', (done) => {
      mockRequest.headers['x-trace-id'] = 'invalid-trace-id';

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: () => {
          expect(mockRequest.traceContext?.traceId).toMatch(/^[a-f0-9]{32}$/);
          expect(mockRequest.traceContext?.traceId).not.toBe(
            'invalid-trace-id',
          );
          done();
        },
      });
    });

    it('should handle array of trace IDs and use first valid one', (done) => {
      const validTraceId = 'b'.repeat(32);
      mockRequest.headers['x-trace-id'] = [validTraceId, 'another-id'];

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: () => {
          expect(mockRequest.traceContext?.traceId).toBe(validTraceId);
          done();
        },
      });
    });

    it('should always generate new spanId regardless of headers', (done) => {
      const validTraceId = 'c'.repeat(32);
      mockRequest.headers['x-trace-id'] = validTraceId;

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: (result1) => {
          const firstSpanId = mockRequest.traceContext?.spanId;

          // Reset for second call
          mockRequest.traceContext = undefined;
          mockResponse.setHeader.mockClear();

          interceptor
            .intercept(mockExecutionContext, mockCallHandler)
            .subscribe({
              next: () => {
                const secondSpanId = mockRequest.traceContext?.spanId;
                expect(firstSpanId).toBeDefined();
                expect(secondSpanId).toBeDefined();
                expect(firstSpanId).not.toBe(secondSpanId);
                done();
              },
            });
        },
      });
    });

    it('should propagate trace context to RequestContextService', (done) => {
      const runSpy = jest.spyOn(requestContextService, 'run');

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: () => {
          expect(runSpy).toHaveBeenCalledWith(
            expect.objectContaining({
              traceId: expect.stringMatching(/^[a-f0-9]{32}$/),
              spanId: expect.stringMatching(/^[a-f0-9]{16}$/),
            }),
            expect.any(Function),
          );
          done();
        },
      });
    });

    it('should call next.handle() within context', (done) => {
      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: () => {
          expect(mockCallHandler.handle).toHaveBeenCalled();
          done();
        },
      });
    });
  });
});
