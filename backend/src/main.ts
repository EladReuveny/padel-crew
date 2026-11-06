import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { Logger, LoggerErrorInterceptor } from 'nestjs-pino';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  const logger = app.get(Logger);
  app.useLogger(logger);
  app.useGlobalInterceptors(new LoggerErrorInterceptor());

  app.use(helmet());
  app.use(cookieParser());
  app.enableCors({
    origin:
      configService.get<string>('FRONTEND_URL') ?? 'http://localhost:5173',
    credentials: true,
  });

  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const PORT = configService.get<number>('PORT') ?? 3000;
  const NODE_ENV = configService.get<string>('NODE_ENV') ?? 'dev';
  const BACKEND_URL =
    configService.get<string>('API_URL') ?? `http://localhost:3000/api/v1`;
  await app.listen(PORT, () => {
    logger.log(
      `Server is running on ${NODE_ENV.toUpperCase()} mode at ${BACKEND_URL}`,
    );
  });
}

void bootstrap();
