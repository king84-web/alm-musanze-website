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

  app.enableCors({
    origin: [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://alm-musanze-website-web.vercel.app',
      // TODO: Add Render backend URL here once deployed
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
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
  await app.listen(port, '0.0.0.0');

  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
