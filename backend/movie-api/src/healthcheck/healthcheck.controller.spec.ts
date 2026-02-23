import { Test, TestingModule } from '@nestjs/testing';
import { RequestContextService } from '../common/context/request-context.service';
import { AppLoggerService } from '../common/services/app-logger.service';
import { HealthcheckController } from './healthcheck.controller';
import { HealthcheckService } from './healthcheck.service';

describe('HealthcheckController', () => {
  let healthcheckController: HealthcheckController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [HealthcheckController],
      providers: [HealthcheckService, RequestContextService, AppLoggerService],
    }).compile();

    healthcheckController = app.get<HealthcheckController>(
      HealthcheckController,
    );
  });

  describe('health check', () => {
    it('should return API health status', () => {
      expect(healthcheckController.getHealthcheck()).toEqual({
        data: {
          status: 'ok',
        },
      });
    });
  });
});
