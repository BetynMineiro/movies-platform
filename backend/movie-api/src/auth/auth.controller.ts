import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse as ApiResponseDoc,
  ApiTags,
} from '@nestjs/swagger';
import type { ApiResponse } from '../common/interfaces/api-response.interface';
import { Public } from './decorators/public.decorator';
import { AuthService } from './auth.service';
import type { LoginResponse } from './interfaces/login-response.interface';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login' })
  @ApiResponseDoc({
    status: 200,
    description: 'Login successful',
    type: LoginResponseDto,
  })
  @ApiResponseDoc({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto): Promise<ApiResponse<LoginResponse>> {
    const data = await this.authService.login(
      loginDto.email,
      loginDto.password,
    );
    return { data };
  }
}
