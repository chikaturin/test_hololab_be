import {
  Controller,
  Post,
  Body,
  Req,
  HttpCode,
  HttpStatus,
  Res,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiTags,
  ApiBearerAuth,
  ApiHeader,
} from '@nestjs/swagger';
import { AuthService } from '../auth.service';
import { Auth } from '../entities/auth.entity';
import type { Request } from 'express';
import { setCookie } from '../../util/cookie.utils';
import { LoginDto, RefreshTokenDto, RegisterDto } from '../dto/index.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Register a new user' })
  async register(@Body() registerDto: RegisterDto): Promise<Auth> {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login a user' })
  async login(
    @Body() loginDto: LoginDto,
    @Req() req: Request,
  ): Promise<{ accessToken: string; refreshToken: string; sessionId: string }> {
    const ip = (req.headers['x-forwarded-for'] as string) || req.ip || '';
    const userAgent = req.headers['user-agent'] || '';
    return this.authService.login(loginDto, ip, userAgent);
  }

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiBearerAuth('accessToken')
  @ApiHeader({ name: 'refreshToken', description: 'Refresh token' })
  @ApiHeader({ name: 'sessionId', description: 'Session ID' })
  async refreshToken(
    @Body() refreshTokenDto: RefreshTokenDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const userAgent = request.headers['user-agent'] || '';
    const ipAddress = request.ip || '';
    const data = (await this.authService.refreshToken(
      refreshTokenDto.refreshToken,
      refreshTokenDto.sessionId,
      userAgent,
      ipAddress,
    )) as any;

    setCookie(response as any, 'accessToken', data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24 * 30,
    });
    setCookie(response as any, 'session', data.sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24 * 30,
    });

    return data;
  }
}
