import { Global, Module } from '@nestjs/common';
import { ExcelService } from './excel.service';

/**
 * Shared Excel exporter module.
 *
 * Marked `@Global` so any feature module (Training, Audit, Visitors, Kaizen,
 * Report, …) can inject `ExcelService` without an explicit imports entry.
 * Replaces the legacy `ExcelReport/Helper/ExcelHelper.php` (PhpSpreadsheet).
 */
@Global()
@Module({
  providers: [ExcelService],
  exports: [ExcelService],
})
export class ExcelModule {}
