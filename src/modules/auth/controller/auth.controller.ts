import {
  Controller,
  Post,
  Body,
  Req,
  HttpCode,
  HttpStatus,
  Res,
  UseGuards,
  Get,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiTags,
  ApiResponse,
  ApiBearerAuth,
  ApiHeader,
  ApiSecurity,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { AuthService } from '../auth.service';
import type { Response } from 'express';
import { setCookie } from '../../../utils/cookie.utils';
import {
  LoginDto,
  RefreshTokenDto,
  LogoutDto,
  ChangePasswordDto,
} from '../dto/index.dto';
import { AuthGuard } from '../../../common/guards/auth.guard';
import { PermissionsGuard } from '../../../common/guards/permission.guard';
import {
  ResponseMessage,
  Permissions,
} from '../../../common/decorators/index.decorators';
import type { IUserRequest } from '../../../interfaces';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Success')
  @UseGuards(AuthGuard, PermissionsGuard)
  @ApiBearerAuth()
  @ApiSecurity('x-session-id')
  auth(@Req() request: IUserRequest) {
    const user = request.user as any;

    const result = {
      ...user,
      userRoles: user.userRoles?.map((ur) => ({
        role: {
          name: ur.role?.name,
          _idRole: ur.role?._id || ur.roleId?.toString(),
        },
      })),
    };

    console.log('Final result._id:', result._id);
    return result;
  }

  // @Post('register')
  // @HttpCode(HttpStatus.OK)
  // @ResponseMessage('Register a new user')
  // @ApiOperation({ summary: 'Register a new user' })
  // async register(@Body() registerDto: RegisterDto): Promise<User> {
  //   return this.authService.register(registerDto);
  // }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Login a user')
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
  @ResponseMessage('Refresh access token using refresh token')
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

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Logout from a session')
  @ApiOperation({ summary: 'Logout from a session - *auth.logout' })
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiSecurity('x-session-id')
  async logout(@Req() request: any, @Body() body: LogoutDto) {
    await this.authService.logout(request.user.id, body.sessionId);
    return { message: 'Logged out successfully' };
  }

  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Password changed successfully')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiSecurity('x-session-id')
  @ApiOperation({ summary: 'Change user password' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  async changePassword(
    @Req() request: IUserRequest,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    const userId = request.user._id || request.user.id;
    return this.authService.changePassword(userId, changePasswordDto);
  }
}
