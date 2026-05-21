import { Global, Module, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { initDb, getDb, Sequelize } from '@hero/db';

export const SEQUELIZE = 'SEQUELIZE';

@Global()
@Module({
  providers: [
    {
      provide: SEQUELIZE,
      inject: [ConfigService],
      useFactory: (cfg: ConfigService): Sequelize =>
        initDb({
          host: cfg.get<string>('DB_HOST', '127.0.0.1'),
          port: Number(cfg.get<string>('DB_PORT', '3306')),
          database: cfg.get<string>('DB_NAME', 'heronewlanding'),
          username: cfg.get<string>('DB_USER', 'root'),
          password: cfg.get<string>('DB_PASSWORD', ''),
          logging: cfg.get<string>('NODE_ENV') === 'development',
        }),
    },
  ],
  exports: [SEQUELIZE],
})
export class DbModule implements OnModuleInit {
  async onModuleInit() {
    try {
      await getDb().authenticate();
      // eslint-disable-next-line no-console
      console.log('[db] connected');
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('[db] connection failed (continuing for scaffold):', (e as Error).message);
    }
  }
}
