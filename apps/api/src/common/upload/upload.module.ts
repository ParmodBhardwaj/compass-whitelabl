import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { diskStorage } from 'multer';
import { extname, join } from 'node:path';
import { mkdirSync } from 'node:fs';
import { UploadController } from './upload.controller';

const TIMESTAMP_NAME = (req: any, file: Express.Multer.File, cb: (err: any, name: string) => void) => {
  const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
  cb(null, `${Date.now()}-${Math.round(Math.random() * 1e8)}-${safe}`);
};

@Module({
  imports: [
    MulterModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => {
        const root = cfg.get<string>('FILE_STORAGE_ROOT') ?? './storage';
        mkdirSync(join(root, 'images'), { recursive: true });
        mkdirSync(join(root, 'docs'), { recursive: true });
        return {
          storage: diskStorage({
            destination: (_req, file, cb) => {
              const ext = extname(file.originalname).toLowerCase();
              const isImage = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'].includes(ext);
              cb(null, join(root, isImage ? 'images' : 'docs'));
            },
            filename: TIMESTAMP_NAME,
          }),
          limits: { fileSize: 25 * 1024 * 1024 },
        };
      },
    }),
  ],
  controllers: [UploadController],
  exports: [MulterModule],
})
export class UploadModule {}
