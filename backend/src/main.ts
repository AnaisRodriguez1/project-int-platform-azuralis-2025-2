import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ Valida automáticamente todos los DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // elimina campos no definidos en los DTOs
      forbidNonWhitelisted: true, // lanza error si hay campos no permitidos
      transform: true, // convierte tipos automáticamente (string → number, etc.)
    }),
  );

  await app.listen(3000);
}
bootstrap();
