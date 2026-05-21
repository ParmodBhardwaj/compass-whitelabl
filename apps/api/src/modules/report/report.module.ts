import { Module } from '@nestjs/common';
import { ReportController } from './report.controller';
import { ReportService } from './report.service';

/**
 * Report — Wave 4 module.
 *
 * Provides Excel (.xlsx) export for:
 *   GET /v2/reports/training   — Training records
 *   GET /v2/reports/kaizen     — Kaizen submissions
 *   GET /v2/reports/oee        — OEE log
 *   GET /v2/reports/mpsheet    — MP Sheet requests
 *   GET /v2/reports/visitors   — Visitor log
 *
 * All endpoints accept ?from=YYYY-MM-DD&to=YYYY-MM-DD plus module-specific
 * filters and return a downloadable .xlsx file.
 *
 * Requires exceljs: pnpm --filter @hero/api add exceljs
 */
@Module({
  controllers: [ReportController],
  providers: [ReportService],
  exports: [ReportService],
})
export class ReportModule {}
