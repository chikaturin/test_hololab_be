import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { PermissionsGuard } from './common/guards/permission.guard';
import { AuthGuard } from './common/guards/auth.guard';
import helmet from 'helmet';
declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.use(cookieParser());
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      crossOriginEmbedderPolicy: false,
    }),
  );

  app.enableCors({
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
      'x-session-id',
      'accessToken',
    ],
    exposedHeaders: ['x-session-id', 'accessToken'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });
  const config = new DocumentBuilder()
    .setTitle('Test Hololab API')
    .setDescription('API documentation for Test Hololab project')
    .setVersion('1.0')
    .addTag('products')
    .addTag('categories')
    .addBearerAuth()
    .addApiKey(
      {
        type: 'apiKey',
        name: 'x-session-id',
        description: 'Enter your session ID',
        in: 'header',
      },
      'x-session-id',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
  console.log(
    `🚀 Application is running on: http://localhost:${process.env.PORT ?? 3000}`,
  );
  console.log(
    `📚 Swagger documentation is available at: http://localhost:${process.env.PORT ?? 3000}/api`,
  );

  try {
    const Redis = require('ioredis');
    const redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD || '',
    });

    const ping = await redis.ping();
    if (ping === 'PONG') {
      console.log('✅ Redis connected successfully');
    } else {
      console.log('❌ Redis connection failed');
    }
    await redis.disconnect();
  } catch (error) {
    console.log('❌ Redis connection check failed:', error.message);
  }

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();
