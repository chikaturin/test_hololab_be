import { RedisModuleOptions } from '@nestjs-modules/ioredis';
import { ConfigService } from '@nestjs/config';

export const getRedisConfig = (
  configService: ConfigService,
): RedisModuleOptions => ({
  type: 'single',
  url: `redis://${configService.get('REDIS_HOST')}:${configService.get('REDIS_PORT')}`,
  options: {
    password: configService.get('REDIS_PASSWORD'),
    db: configService.get('REDIS_DB'),
  },
});
