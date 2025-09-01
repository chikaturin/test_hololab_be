import { Injectable, UnauthorizedException } from '@nestjs/common';
import { parseDeviceInfo } from '../../utils/device.utils';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { getRedisCloudConfig } from '../../config/redis.config';
import { createClient } from 'redis';
import {
  TokenPair,
  TokenPayload,
  TokenRedis,
  SessionData,
} from './interfaces/token.interface';

@Injectable()
export class TokenService {
  private redisClient;

  constructor(
    @InjectRedis() private readonly redis: Redis,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    const redisConfig = getRedisCloudConfig(this.configService);
    if (redisConfig) {
      this.redisClient = createClient(redisConfig);
    } else {
      console.warn('⚠️ Redis Cloud config not available, using fallback');
      this.redisClient = createClient({
        socket: {
          host: 'localhost',
          port: 6379,
        },
      });
    }

    this.redisClient.on('error', (err) => {
      console.log('Redis Client Error', err);
    });

    this.redisClient.connect().catch(console.error);
  }

  private parseExpirationTime(expiration: string): number {
    const match = expiration.match(/^(\d+)([smhd])$/);
    if (!match) return 0;

    const [, value, unit] = match;
    const numValue = parseInt(value, 10);

    switch (unit) {
      case 's':
        return numValue * 1000;
      case 'm':
        return numValue * 60 * 1000;
      case 'h':
        return numValue * 60 * 60 * 1000;
      case 'd':
        return numValue * 24 * 60 * 60 * 1000;
      default:
        return 0;
    }
  }

  async saveTokenToRedis(
    userId: string,
    tokenData: TokenRedis,
  ): Promise<string> {
    const key = `user_sessions:${userId}`;
    const sessionId = `session:${Date.now()}`;

    await this.redis.hset(key, sessionId, JSON.stringify(tokenData));
    await this.redis.expire(key, 30 * 24 * 60 * 60);
    return sessionId;
  }

  async generateTokenPair(
    payload: TokenPayload,
    ipAddress: string,
    userAgent: string,
  ): Promise<TokenPair & { sessionId: string }> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_SECRET_AT'),
        expiresIn: this.configService.get<string>('JWT_EXPIRATION_AT'),
      }),

      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_SECRET_RT'),
        expiresIn: this.configService.get<string>('JWT_EXPIRATION_RT'),
      }),
    ]);
    const expirationTime = this.parseExpirationTime(
      this.configService.get<string>('JWT_EXPIRATION_RT') || '7d',
    );

    const deviceInfo = parseDeviceInfo(userAgent, ipAddress);

    const sessionData: TokenRedis = {
      refresh_token: refreshToken,
      user_agent: userAgent,
      ip_address: ipAddress,
      device_info: {
        deviceName: deviceInfo.deviceName || 'Unknown',
        deviceType: deviceInfo.deviceType || 'desktop',
        os: deviceInfo.os || 'Unknown',
        browser: deviceInfo.browser || 'Unknown',
        ipAddress: deviceInfo.ipAddress || '0.0.0.0',
      },
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + expirationTime).toISOString(),
      revoked: false,
    };

    const sessionId = await this.saveTokenToRedis(payload.userId, sessionData);

    console.log('=== SESSION DATA ===');
    console.log(sessionData);
    console.log('===================');

    return { accessToken, refreshToken, sessionId };
  }

  async getUserSessions(userId: string): Promise<SessionData[]> {
    const key = `user_sessions:${userId}`;
    const sessions = await this.redis.hgetall(key);

    return Object.entries(sessions).reduce((acc, [sessionId, sessionData]) => {
      if (sessionData) {
        const parsedData = JSON.parse(sessionData) as TokenRedis;

        acc.push({
          ...parsedData,
          session_id: sessionId,
          refresh_token: 'Something is hidden! :)',
        });
      }

      return acc;
    }, [] as SessionData[]);
  }

  async revokeSession(userId: string, sessionId: string): Promise<void> {
    const key = `user_sessions:${userId}`;
    await this.redis.hdel(key, sessionId);
  }

  async getUserSession(userId: string, sessionId: string): Promise<TokenRedis> {
    const key = `user_sessions:${userId}`;
    const sessionData = await this.redis.hget(key, sessionId);
    if (!sessionData) {
      throw new UnauthorizedException();
    }
    return JSON.parse(sessionData) as TokenRedis;
  }

  async verifyToken(
    token: string,
    sessionId: string,
    isRefreshToken = false,
  ): Promise<TokenPayload> {
    const secret = isRefreshToken
      ? this.configService.get<string>('JWT_SECRET_RT')
      : this.configService.get<string>('JWT_SECRET_AT');
    const ignoreExpiration =
      this.configService.get<string>('JWT_IGNORE_EXPIRATION') === 'true';

    try {
      const payload = await this.jwtService.verifyAsync<TokenPayload>(token, {
        secret,
        ignoreExpiration,
      });
      const session = await this.getUserSession(payload.userId, sessionId);
      if (session.revoked) {
        throw new UnauthorizedException('Session has been revoked');
      }
      return payload;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  async storeResetToken(
    userId: string,
    token: string,
    expiry: Date,
  ): Promise<void> {
    const key = `reset_token:${token}`;
    await this.redis.set(key, userId);
    await this.redis.expire(
      key,
      Math.floor((expiry.getTime() - Date.now()) / 1000),
    );
  }

  async getUserIdFromResetToken(token: string): Promise<string | null> {
    const key = `reset_token:${token}`;
    return await this.redis.get(key);
  }

  async deleteResetToken(token: string): Promise<void> {
    const key = `reset_token:${token}`;
    await this.redis.del(key);
  }

  async removeTokenFromRedis(userId: string, sessionId: string): Promise<void> {
    const key = `user_sessions:${userId}`;
    await this.redis.hdel(key, sessionId);
  }
}
