import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { HeroLoginUsage } from '@hero/db/src/models/generated';

/**
 * Request audit-log middleware.
 *
 * Logs every successful (2xx) authenticated API call to `hero_login_usage`.
 * The table only has (id, user_id, creation_date) — we use user_id from the
 * JWT payload that Passport attaches as `req.user`.
 *
 * Non-authenticated routes (login, health) are skipped gracefully: if
 * req.user is absent we still let the request through, just don't write a row.
 *
 * Apply via AppModule.configure(consumer) with MiddlewareConsumer.
 */
@Injectable()
export class AuditLogMiddleware implements NestMiddleware {
  private readonly logger = new Logger(AuditLogMiddleware.name);

  use(req: Request, res: Response, next: NextFunction) {
    res.on('finish', () => {
      const status = res.statusCode;
      if (status < 200 || status >= 300) return;          // only log successes
      if (req.method === 'OPTIONS') return;               // skip preflight

      const user = (req as any).user as { id?: number; userId?: number } | undefined;
      const userId = user?.id ?? user?.userId;
      if (!userId) return;                                 // unauthenticated route

      HeroLoginUsage.create({
        userId,
        creationDate: new Date(),
      } as any).catch((err: Error) => {
        // Non-fatal: log the error but don't crash the request pipeline
        this.logger.warn(`audit-log write failed: ${err?.message}`);
      });
    });

    next();
  }
}
