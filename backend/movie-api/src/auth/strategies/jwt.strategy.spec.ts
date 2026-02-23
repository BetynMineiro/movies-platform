import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy } from './jwt.strategy';
import type { JwtPayload } from '../interfaces/jwt-payload.interface';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JwtStrategy],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
  });

  describe('validate', () => {
    it('should return payload when sub is present', async () => {
      const payload: JwtPayload = {
        sub: 'user-id-123',
        email: 'test@example.com',
        iat: 1234567890,
        exp: 1234571490,
      };

      const result = await strategy.validate(payload);

      expect(result).toEqual({
        sub: 'user-id-123',
        email: 'test@example.com',
      });
    });

    it('should return payload without optional fields', async () => {
      const payload: JwtPayload = {
        sub: 'user-id-456',
      };

      const result = await strategy.validate(payload);

      expect(result).toEqual({
        sub: 'user-id-456',
        email: undefined,
      });
    });

    it('should throw UnauthorizedException when sub is missing', async () => {
      const payload = {
        email: 'test@example.com',
      } as JwtPayload;

      await expect(strategy.validate(payload)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(strategy.validate(payload)).rejects.toThrow(
        'Invalid token payload',
      );
    });

    it('should throw UnauthorizedException when sub is empty string', async () => {
      const payload: JwtPayload = {
        sub: '',
        email: 'test@example.com',
      };

      await expect(strategy.validate(payload)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should return payload with only sub field when email is not provided', async () => {
      const payload: JwtPayload = {
        sub: 'user-789',
      };

      const result = await strategy.validate(payload);

      expect(result).toHaveProperty('sub', 'user-789');
      expect(result).toHaveProperty('email', undefined);
    });
  });

  describe('constructor', () => {
    it('should be defined', () => {
      expect(strategy).toBeDefined();
    });

    it('should use JWT_SECRET from environment or default', () => {
      const originalSecret = process.env.JWT_SECRET;

      delete process.env.JWT_SECRET;
      const strategyWithoutEnv = new JwtStrategy();
      expect(strategyWithoutEnv).toBeDefined();

      process.env.JWT_SECRET = originalSecret;
    });
  });
});
