import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Auth, AuthDocument } from './entities/auth.entity';
import { hashPassword, comparePassword } from '../util/bcrypt';
import { TokenService } from '../token/token.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Auth.name)
    private readonly authModel: Model<AuthDocument>,
    private readonly tokenService: TokenService,
  ) {}

  async register(registerDto: RegisterDto): Promise<Auth> {
    const hashedPassword = await hashPassword(registerDto.password);
    const newAuth = new this.authModel({
      ...registerDto,
      password: hashedPassword,
    });
    return newAuth.save();
  }

  async login(
    loginDto: LoginDto,
    ipAddress: string,
    userAgent: string,
  ): Promise<{ accessToken: string; refreshToken: string; sessionId: string }> {
    const user = await this.authModel.findOne({ email: loginDto.email });
    if (!user) {
      throw new UnauthorizedException('Email is not exist');
    }

    const isValid = await comparePassword(loginDto.password, user.password);
    if (!isValid) {
      throw new UnauthorizedException('Password is incorrect');
    }

    const { accessToken, refreshToken, sessionId } =
      await this.tokenService.generateTokenPair(
        { userId: user.id, email: user.email },
        ipAddress,
        userAgent,
      );

    return { accessToken, refreshToken, sessionId };
  }

  async refreshToken(
    refreshToken: string,
    sessionId: string,
    userAgent: string,
    ipAddress: string,
  ): Promise<{ accessToken: string; refreshToken: string; sessionId: string }> {
    const payload = await this.tokenService.verifyToken(refreshToken, true);
    const user = await this.authModel.findById(payload.userId);

    if (!user) {
      throw new UnauthorizedException('Invalid token');
    }
    await this.tokenService.revokeSession(payload.userId, sessionId);
    const tokenPair = await this.tokenService.generateTokenPair(
      {
        userId: user.id,
        email: user.email,
      },
      userAgent,
      ipAddress,
    );

    return { ...tokenPair, sessionId: tokenPair.sessionId };
  }
}
