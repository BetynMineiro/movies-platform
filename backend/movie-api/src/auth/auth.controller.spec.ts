import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import type { LoginResponse } from './interfaces/login-response.interface';
import { LoginDto } from './dto/login.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  const mockLoginResponse: LoginResponse = {
    accessToken: 'jwt-token',
    user: {
      id: '123',
      email: 'test@example.com',
      role: 'user',
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should return ApiResponse with login data', async () => {
      authService.login.mockResolvedValue(mockLoginResponse);

      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const result = await controller.login(loginDto);

      expect(authService.login).toHaveBeenCalledWith(
        loginDto.email,
        loginDto.password,
      );
      expect(result).toEqual({
        data: mockLoginResponse,
      });
    });

    it('should propagate errors from AuthService', async () => {
      authService.login.mockRejectedValue(new Error('Invalid credentials'));

      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      await expect(controller.login(loginDto)).rejects.toThrow(
        'Invalid credentials',
      );
    });
  });
});
