import { RedisModuleOptions } from '@nestjs-modules/ioredis';
import { ConfigService } from '@nestjs/config';

export const getRedisConfig = (
  configService: ConfigService,
): RedisModuleOptions => ({
  type: 'single',
  options: {
    host: configService.get('REDIS_HOST'),
    port: configService.get('REDIS_PORT'),
    username: configService.get('REDIS_USERNAME'),
    password: configService.get('REDIS_PASSWORD'),
    db: configService.get('REDIS_DB'),
  },
});

export const getRedisCloudConfig = (configService: ConfigService) => ({
  username: configService.get('REDIS_USERNAME'),
  password: configService.get('REDIS_PASSWORD'),
  socket: {
    host: configService.get('REDIS_HOST'),
    port: configService.get('REDIS_PORT'),
  },
});
