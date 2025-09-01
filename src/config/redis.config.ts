import { RedisModuleOptions } from '@nestjs-modules/ioredis';
import { ConfigService } from '@nestjs/config';

export const getRedisConfig = (
  configService: ConfigService,
): RedisModuleOptions => {
  const host = configService.get('REDIS_HOST');
  const port = configService.get('REDIS_PORT');
  const username = configService.get('REDIS_USERNAME');
  const password = configService.get('REDIS_PASSWORD');
  const db = configService.get('REDIS_DB');

  if (!host || !port || !password) {
    console.warn(
      '⚠️ Redis configuration incomplete. Redis module may not work properly.',
    );

    return {
      type: 'single',
      options: {
        host: host || 'localhost',
        port: port || 6379,
        username: username || 'default',
        password: password || '',
        db: db || 0,
        lazyConnect: true,
        connectTimeout: 5000,
        commandTimeout: 3000,
      },
    };
  }

  return {
    type: 'single',
    options: {
      host,
      port: parseInt(port.toString()),
      username,
      password,
      db: parseInt(db?.toString() || '0'),
      lazyConnect: true,
      connectTimeout: 10000,
      commandTimeout: 5000,
    },
  };
};

export const getRedisCloudConfig = (configService: ConfigService) => {
  const host = configService.get('REDIS_HOST');
  const port = configService.get('REDIS_PORT');
  const username = configService.get('REDIS_USERNAME');
  const password = configService.get('REDIS_PASSWORD');

  if (!host || !port || !password) {
    console.warn('⚠️ Redis Cloud configuration incomplete.');
    return null;
  }

  return {
    username,
    password,
    socket: {
      host,
      port: parseInt(port.toString()),
    },
  };
};
