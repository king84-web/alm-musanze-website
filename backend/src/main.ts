import { NestApplication, NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import morgan from 'morgan';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';
import { JwtExceptionFilter } from './filters/jwt-exception.filter';
import { ConfigService } from '@nestjs/config/dist/config.service';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestApplication>(AppModule);

  const configService = app.get(ConfigService);

  const allowedDomains = configService.get<string>('FRONTEND_URL');

  const allowedOrigins = allowedDomains
    ? allowedDomains.split(',').map((domain) => domain.trim())
    : ['http://localhost:3000'];

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.error(`Blocked CORS request from origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-csrf-token'],
    credentials: true,
    optionsSuccessStatus: 200,
    preflightContinue: false,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: false,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.setGlobalPrefix('api');
  app.useGlobalFilters(new AllExceptionsFilter(), new JwtExceptionFilter());
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads',
  });

  const port = process.env.PORT || 3000;
  app.use(
    morgan('dev', {
      skip: (req, res) => res.statusCode === 304,
    }),
  );
  await app.listen(port);

  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
