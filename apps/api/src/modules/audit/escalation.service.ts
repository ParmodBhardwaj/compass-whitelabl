import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { AuditService } from './audit.service';

// Cron wiring (via @nestjs/schedule) to be added when that dep is installed.
// For now `run()` is exposed for manual invocation / external scheduler.
@Injectable()
export class AuditEscalationService implements OnModuleInit {
  private readonly log = new Logger(AuditEscalationService.name);
  constructor(private readonly audit: AuditService) {}

  onModuleInit() {
    const everyDayMs = 24 * 60 * 60 * 1000;
    setInterval(() => this.run().catch((e) => this.log.error(e)), everyDayMs);
  }

  async run() {
    for (const target of ['before_30', 'on_cutoff', 'after_7', 'after_15'] as const) {
      const rows = await this.audit.sectionsForEscalation(target);
      this.log.log(`${target}: ${rows.length} sections`);
      // TODO: build recipient list per matrix (PO/RO/FH/DH/IA) and dispatch via Mail integration.
    }
  }
}
