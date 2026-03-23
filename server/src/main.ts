import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors({
    origin: 'http://localhost:5173',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  app.useStaticAssets(join(process.cwd(), 'uploads', 'covers'), {
    prefix: '/uploads/covers/',
  });

  app.useStaticAssets(join(process.cwd(), 'uploads', 'previews'), {
    prefix: '/uploads/previews/',
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();