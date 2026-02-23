import { Test, TestingModule } from '@nestjs/testing';
import { RequestContextService } from '../common/context/request-context.service';
import { AppLoggerService } from '../common/services/app-logger.service';
import { HealthCheckController } from './healthcheck.controller';
import { HealthCheckService } from './healthcheck.service';

describe('HealthCheckController', () => {
  let healthCheckController: HealthCheckController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [HealthCheckController],
      providers: [HealthCheckService, RequestContextService, AppLoggerService],
    }).compile();

    healthCheckController = app.get<HealthCheckController>(
      HealthCheckController,
    );
  });

  describe('health check', () => {
    it('should return API health status', () => {
      expect(healthCheckController.getHealthCheck()).toEqual({
        data: {
          status: 'ok',
        },
      });
    });
  });
});
