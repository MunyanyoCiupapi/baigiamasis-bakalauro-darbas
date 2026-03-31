import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
  });

  app.use(
    express.json({
      verify: (req: any, res, buf) => {
        if (req.originalUrl.startsWith('/purchases/webhook')) {
          req.rawBody = buf;
        }
      },
    }),
  );

  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
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