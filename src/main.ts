import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth/auth.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );

  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:8888',
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization',
  });

  // Create the first SUPER_ADMIN if it doesn't exist
  const authService = app.get(AuthService);
  await authService.createInitialSuperAdmin();

  const port = process.env.PORT || 4000;

  await app.listen(Number(port));

  console.log(`Backend running on http://localhost:${port}`);
}

bootstrap();