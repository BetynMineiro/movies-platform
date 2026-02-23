import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { RequestContextService } from '../context/request-context.service';
import { AppLoggerService } from './app-logger.service';

describe('AppLoggerService', () => {
  let appLoggerService: AppLoggerService;
  let requestContextService: RequestContextService;
  let loggerSpy: jest.SpyInstance;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppLoggerService, RequestContextService],
    }).compile();

    appLoggerService = module.get<AppLoggerService>(AppLoggerService);
    requestContextService = module.get<RequestContextService>(
      RequestContextService,
    );

    loggerSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
    jest.spyOn(Logger.prototype, 'debug').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('log', () => {
    it('should log message with trace context when available', () => {
      const traceContext = {
        traceId: 'abc123',
        spanId: 'def456',
      };

      requestContextService.run(traceContext, () => {
        appLoggerService.log('Test message', 'TestContext', { userId: 42 });
      });

      expect(loggerSpy).toHaveBeenCalledWith(
        JSON.stringify({
          message: 'Test message',
          traceId: 'abc123',
          spanId: 'def456',
          userId: 42,
        }),
        'TestContext',
      );
    });

    it('should log message with null trace context when not available', () => {
      appLoggerService.log('Test message', 'TestContext');

      expect(loggerSpy).toHaveBeenCalledWith(
        JSON.stringify({
          message: 'Test message',
          traceId: null,
          spanId: null,
        }),
        'TestContext',
      );
    });

    it('should log message without metadata', () => {
      appLoggerService.log('Simple message');

      expect(loggerSpy).toHaveBeenCalledWith(
        JSON.stringify({
          message: 'Simple message',
          traceId: null,
          spanId: null,
        }),
        undefined,
      );
    });
  });

  describe('warn', () => {
    it('should log warning with trace context', () => {
      const warnSpy = jest.spyOn(Logger.prototype, 'warn');
      const traceContext = {
        traceId: 'warn-trace',
        spanId: 'warn-span',
      };

      requestContextService.run(traceContext, () => {
        appLoggerService.warn('Warning message', 'WarnContext', {
          code: 'WARN_001',
        });
      });

      expect(warnSpy).toHaveBeenCalledWith(
        JSON.stringify({
          message: 'Warning message',
          traceId: 'warn-trace',
          spanId: 'warn-span',
          code: 'WARN_001',
        }),
        'WarnContext',
      );
    });
  });

  describe('error', () => {
    it('should log error with trace context and stack trace', () => {
      const errorSpy = jest.spyOn(Logger.prototype, 'error');
      const traceContext = {
        traceId: 'error-trace',
        spanId: 'error-span',
      };
      const stack = 'Error stack trace...';

      requestContextService.run(traceContext, () => {
        appLoggerService.error(
          'Error message',
          'ErrorContext',
          { errorCode: 500 },
          stack,
        );
      });

      expect(errorSpy).toHaveBeenCalledWith(
        JSON.stringify({
          message: 'Error message',
          traceId: 'error-trace',
          spanId: 'error-span',
          errorCode: 500,
        }),
        stack,
        'ErrorContext',
      );
    });

    it('should log error without stack trace', () => {
      const errorSpy = jest.spyOn(Logger.prototype, 'error');

      appLoggerService.error('Error without stack', 'ErrorContext');

      expect(errorSpy).toHaveBeenCalledWith(
        JSON.stringify({
          message: 'Error without stack',
          traceId: null,
          spanId: null,
        }),
        undefined,
        'ErrorContext',
      );
    });
  });

  describe('debug', () => {
    it('should log debug message with metadata', () => {
      const debugSpy = jest.spyOn(Logger.prototype, 'debug');

      appLoggerService.debug('Debug message', 'DebugContext', {
        debugInfo: 'detailed',
      });

      expect(debugSpy).toHaveBeenCalledWith(
        JSON.stringify({
          message: 'Debug message',
          traceId: null,
          spanId: null,
          debugInfo: 'detailed',
        }),
        'DebugContext',
      );
    });
  });

  describe('stringifyPayload', () => {
    it('should include custom metadata fields in payload', () => {
      const metadata = {
        userId: 123,
        action: 'create',
        resource: 'movie',
      };

      appLoggerService.log('Custom metadata test', 'TestContext', metadata);

      expect(loggerSpy).toHaveBeenCalledWith(
        JSON.stringify({
          message: 'Custom metadata test',
          traceId: null,
          spanId: null,
          userId: 123,
          action: 'create',
          resource: 'movie',
        }),
        'TestContext',
      );
    });
  });
});
