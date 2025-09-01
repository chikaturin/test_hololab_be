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

  // Debug environment variables
  console.log('🔧 Environment variables:');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('PORT:', process.env.PORT);
  console.log('REDIS_HOST:', process.env.REDIS_HOST ? 'Set' : 'Not set');
  console.log('REDIS_PORT:', process.env.REDIS_PORT);
  console.log('REDIS_USERNAME:', process.env.REDIS_USERNAME);
  console.log(
    'REDIS_PASSWORD:',
    process.env.REDIS_PASSWORD ? 'Set' : 'Not set',
  );

  // Validate and set port
  let port = 3000; // Default port
  if (process.env.PORT) {
    const envPort = parseInt(process.env.PORT);
    if (envPort >= 0 && envPort < 65536) {
      port = envPort;
    } else {
      console.warn(`⚠️ Invalid PORT value: ${process.env.PORT}. Using default port 3000`);
    }
  }
  
  console.log(`🚀 Starting application on port: ${port}`);

  await app.listen(port, '0.0.0.0');

  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(
    `📚 Swagger documentation is available at: http://localhost:${port}/api`,
  );

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}

// For Vercel serverless functions
if (process.env.NODE_ENV !== 'production') {
  bootstrap();
}

// Export for Vercel
export default bootstrap;
