import { Test, TestingModule } from '@nestjs/testing';
import { HealthcheckController } from './healthcheck.controller';
import { HealthcheckService } from './healthcheck.service';

describe('HealthcheckController', () => {
  let healthcheckController: HealthcheckController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [HealthcheckController],
      providers: [HealthcheckService],
    }).compile();

    healthcheckController = app.get<HealthcheckController>(HealthcheckController);
  });

  describe('health check', () => {
    it('should return API health status on default route', () => {
      expect(healthcheckController.getDefaultHealthcheck()).toEqual({ status: 'ok' });
    });

    it('should return API health status', () => {
      expect(healthcheckController.getHealthcheck()).toEqual({ status: 'ok' });
    });
  });
});
