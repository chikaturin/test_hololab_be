import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RedisModule } from '@nestjs-modules/ioredis';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getMongoConfig } from '../config/mongodb.config';
import { getRedisConfig } from '../config/redis.config';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getMongoConfig,
    }),
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        try {
          const redisConfig = getRedisConfig(configService);

          if (redisConfig.type === 'single' && redisConfig.options) {
            console.log('🔧 Redis configuration loaded:', {
              host: redisConfig.options.host,
              port: redisConfig.options.port,
              username: redisConfig.options.username,
              hasPassword: !!redisConfig.options.password,
            });
          }

          return redisConfig;
        } catch (error) {
          console.error(
            '❌ Failed to load Redis configuration:',
            error.message,
          );

          return {
            type: 'single',
            options: {
              host: 'localhost',
              port: 6379,
              lazyConnect: true,
            },
          };
        }
      },
    }),
  ],
})
export class DatabaseModule {}
