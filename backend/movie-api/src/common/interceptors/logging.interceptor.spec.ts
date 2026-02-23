import { ExecutionContext, CallHandler } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { of, throwError } from 'rxjs';
import { RequestContextService } from '../context/request-context.service';
import { AppLoggerService } from '../services/app-logger.service';
import { LoggingInterceptor } from './logging.interceptor';

describe('LoggingInterceptor', () => {
  let interceptor: LoggingInterceptor;
  let appLogger: AppLoggerService;

  const mockRequest = {
    method: 'GET',
    originalUrl: '/test',
    ip: '127.0.0.1',
    get: jest.fn((header: string) => {
      if (header === 'user-agent') return 'test-agent';
      return undefined;
    }),
    traceContext: {
      traceId: 'test-trace-id',
      spanId: 'test-span-id',
    },
  };

  const mockResponse = {
    statusCode: 200,
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
      providers: [
        LoggingInterceptor,
        {
          provide: AppLoggerService,
          useValue: {
            log: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
            debug: jest.fn(),
          },
        },
        RequestContextService,
      ],
    }).compile();

    interceptor = module.get<LoggingInterceptor>(LoggingInterceptor);
    appLogger = module.get<AppLoggerService>(AppLoggerService);

    mockResponse.statusCode = 200;
    (mockCallHandler.handle as jest.Mock).mockClear();
    (mockCallHandler.handle as jest.Mock).mockReturnValue(of('test'));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('intercept', () => {
    it('should log START message with request details', (done) => {
      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: () => {
          expect(appLogger.log).toHaveBeenCalledWith(
            '[START] HTTP request',
            LoggingInterceptor.name,
            expect.objectContaining({
              method: 'GET',
              originalUrl: '/test',
              ip: '127.0.0.1',
              traceId: 'test-trace-id',
              spanId: 'test-span-id',
              userAgent: 'test-agent',
            }),
          );
          done();
        },
      });
    });

    it('should log END success message for 2xx status codes', (done) => {
      mockResponse.statusCode = 200;

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: () => {
          expect(appLogger.log).toHaveBeenCalledWith(
            '[END] HTTP request success',
            LoggingInterceptor.name,
            expect.objectContaining({
              method: 'GET',
              originalUrl: '/test',
              statusCode: 200,
              durationMs: expect.any(Number),
              traceId: 'test-trace-id',
              spanId: 'test-span-id',
            }),
          );
          done();
        },
      });
    });

    it('should log END success message for 3xx status codes', (done) => {
      mockResponse.statusCode = 302;

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: () => {
          expect(appLogger.log).toHaveBeenCalledWith(
            '[END] HTTP request success',
            LoggingInterceptor.name,
            expect.objectContaining({
              statusCode: 302,
            }),
          );
          done();
        },
      });
    });

    it('should log WARN message for 4xx client error status codes', (done) => {
      mockResponse.statusCode = 404;

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: () => {
          expect(appLogger.warn).toHaveBeenCalledWith(
            '[END] HTTP request with client error',
            LoggingInterceptor.name,
            expect.objectContaining({
              statusCode: 404,
              durationMs: expect.any(Number),
            }),
          );
          done();
        },
      });
    });

    it('should log ERROR message for 5xx server error status codes', (done) => {
      mockResponse.statusCode = 500;

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: () => {
          expect(appLogger.error).toHaveBeenCalledWith(
            '[END] HTTP request with server error',
            LoggingInterceptor.name,
            expect.objectContaining({
              statusCode: 500,
              durationMs: expect.any(Number),
            }),
          );
          done();
        },
      });
    });

    it('should log ERROR with stack trace when exception occurs', (done) => {
      const testError = new Error('Test error');
      (mockCallHandler.handle as jest.Mock).mockReturnValue(
        throwError(() => testError),
      );

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        error: (error) => {
          expect(appLogger.error).toHaveBeenCalledWith(
            '[ERROR] HTTP request failed',
            LoggingInterceptor.name,
            expect.objectContaining({
              method: 'GET',
              originalUrl: '/test',
              durationMs: expect.any(Number),
              traceId: 'test-trace-id',
              spanId: 'test-span-id',
            }),
            testError.stack,
          );
          expect(error).toBe(testError);
          done();
        },
      });
    });

    it('should handle missing traceContext gracefully', (done) => {
      mockRequest.traceContext = undefined as any;

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: () => {
          expect(appLogger.log).toHaveBeenCalledWith(
            '[START] HTTP request',
            LoggingInterceptor.name,
            expect.objectContaining({
              traceId: 'no-trace',
              spanId: 'no-span',
            }),
          );
          done();
        },
      });
    });

    it('should handle missing user-agent header', (done) => {
      mockRequest.get = jest.fn().mockReturnValue(undefined);

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: () => {
          expect(appLogger.log).toHaveBeenCalledWith(
            '[START] HTTP request',
            LoggingInterceptor.name,
            expect.objectContaining({
              userAgent: 'unknown',
            }),
          );
          done();
        },
      });
    });

    it('should calculate duration correctly', (done) => {
      const startTime = Date.now();

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: () => {
          const endTime = Date.now();
          const logCall = (appLogger.log as jest.Mock).mock.calls[1];

          expect(logCall).toBeDefined();
          const metadata = logCall[2];
          expect(metadata.durationMs).toBeGreaterThanOrEqual(0);
          expect(metadata.durationMs).toBeLessThanOrEqual(endTime - startTime);
          done();
        },
      });
    });

    it('should not log ERROR when exception is not an Error instance', (done) => {
      const testError = 'string error';
      (mockCallHandler.handle as jest.Mock).mockReturnValue(
        throwError(() => testError),
      );

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        error: () => {
          expect(appLogger.error).toHaveBeenCalledWith(
            '[ERROR] HTTP request failed',
            LoggingInterceptor.name,
            expect.any(Object),
            undefined,
          );
          done();
        },
      });
    });
  });
});
