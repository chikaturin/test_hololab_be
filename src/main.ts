import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { Handler, NextFunction } from 'express';

declare const module: any;

async function createApp() {
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

  return app;
}

async function bootstrap() {
  const app = await createApp();

  const port = parseInt(process.env.PORT || '3000', 10);
  await app.listen(port, '0.0.0.0');

  console.log(`🚀 Application running on: http://localhost:${port}`);
  console.log(`📚 Swagger docs: http://localhost:${port}/api`);

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}

// ✅ Local/dev thì chạy listen
if (process.env.NODE_ENV !== 'production') {
  bootstrap();
}

// ✅ Production (Vercel) → export handler
let cachedHandler: Handler;
export default async function handler(req: any, res: any) {
  if (!cachedHandler) {
    const app = await createApp();
    await app.init();
    cachedHandler = app.getHttpAdapter().getInstance();
  }
  const next: NextFunction = () => {};
  return cachedHandler(req, res, next);
}
