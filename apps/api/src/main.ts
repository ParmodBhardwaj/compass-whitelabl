import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join, resolve } from 'node:path';
import { mkdirSync } from 'node:fs';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { cors: true });
  app.setGlobalPrefix('v2', { exclude: ['files/(.*)'] });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const storageRoot = resolve(process.env.FILE_STORAGE_ROOT ?? './storage');
  mkdirSync(storageRoot, { recursive: true });
  app.useStaticAssets(storageRoot, { prefix: '/files/' });

  const port = Number(process.env.API_PORT ?? process.env.PORT ?? 4000);
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`[api] listening on http://localhost:${port}/v2  (static: /files → ${storageRoot})`);
}

bootstrap();
