import { Injectable, Logger } from '@nestjs/common';

export interface SheetColumn {
  header: string;
  key: string;
  width?: number;
  /** Optional value transformer per cell (e.g. format dates, decimals). */
  format?: (value: any, row: any) => any;
}

export interface SheetSpec {
  name: string;
  columns: SheetColumn[];
  rows: Record<string, any>[];
  /** Optional title row above the header. */
  title?: string;
}

/**
 * Shared Excel/Workbook exporter — wraps `exceljs` so every module that
 * needs an XLSX download (Training, Audit, Visitors, Kaizen, etc.) gets a
 * consistent styling: red brand header, bold title, frozen header row,
 * auto-sized columns, and proper MIME-typed Buffer output.
 *
 * Replaces the legacy `ExcelReport/Helper/ExcelHelper.php` (PhpSpreadsheet).
 *
 * Usage from a controller:
 *
 *   constructor(private excel: ExcelService) {}
 *
 *   @Get('export')
 *   async export(@Res() res: Response) {
 *     const buffer = await this.excel.workbook([
 *       {
 *         name: 'Training Scores',
 *         title: 'Hero Compass — Training Score Report',
 *         columns: [
 *           { header: 'Employee', key: 'empName', width: 25 },
 *           { header: 'Score',    key: 'totalScore', width: 12, format: v => Number(v).toFixed(2) },
 *         ],
 *         rows: await this.svc.scoreReportRows({ from, to }),
 *       },
 *     ]);
 *     res.set({
 *       'Content-Type': ExcelService.MIME,
 *       'Content-Disposition': 'attachment; filename=training-scores.xlsx',
 *     });
 *     res.send(buffer);
 *   }
 */
@Injectable()
export class ExcelService {
  private readonly logger = new Logger(ExcelService.name);

  static readonly MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

  /** Lazy-load exceljs so non-report environments don't pay the load cost. */
  private async lib(): Promise<typeof import('exceljs')> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      return require('exceljs') as typeof import('exceljs');
    } catch {
      throw new Error(
        'exceljs is not installed. Run: pnpm --filter @hero/api add exceljs',
      );
    }
  }

  /**
   * Build an XLSX Buffer from one or more sheet specs. Returns a Buffer
   * the controller can stream directly to the response.
   */
  async workbook(sheets: SheetSpec[]): Promise<Buffer> {
    const ExcelJS = await this.lib();
    const wb = new ExcelJS.Workbook();
    wb.creator = 'Hero Compass';
    wb.created = new Date();

    for (const spec of sheets) {
      this.buildSheet(wb, spec);
    }

    const out = await wb.xlsx.writeBuffer();
    return Buffer.isBuffer(out) ? out : Buffer.from(out as any);
  }

  /**
   * Convenience single-sheet helper for the common case.
   */
  async sheet(spec: SheetSpec): Promise<Buffer> {
    return this.workbook([spec]);
  }

  private buildSheet(wb: import('exceljs').Workbook, spec: SheetSpec) {
    const ws = wb.addWorksheet(spec.name);

    let firstDataRow = 1;

    // Optional title row (merged across all columns, large bold).
    if (spec.title) {
      const titleRow = ws.addRow([spec.title]);
      const lastCol = spec.columns.length;
      ws.mergeCells(1, 1, 1, lastCol);
      titleRow.getCell(1).font = { size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
      titleRow.getCell(1).fill = {
        type: 'pattern', pattern: 'solid',
        fgColor: { argb: 'FFE2231A' }, // Hero red
      };
      titleRow.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' };
      titleRow.height = 26;
      firstDataRow = 2;
    }

    // Configure columns BEFORE we add header so exceljs picks up widths.
    ws.columns = spec.columns.map((c) => ({
      header: c.header,
      key: c.key,
      width: c.width ?? 16,
    }));

    // exceljs auto-creates the header row from `columns` — style it.
    const headerRowIdx = firstDataRow;
    const headerRow = ws.getRow(headerRowIdx);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern', pattern: 'solid',
      fgColor: { argb: 'FF333333' },
    };
    headerRow.alignment = { vertical: 'middle' };

    // Data rows, applying any per-column formatter.
    for (const r of spec.rows) {
      const mapped: Record<string, any> = {};
      for (const c of spec.columns) {
        const raw = (r as any)[c.key];
        mapped[c.key] = c.format ? c.format(raw, r) : raw;
      }
      ws.addRow(mapped);
    }

    // Freeze the header row so it stays visible while scrolling.
    ws.views = [{ state: 'frozen', ySplit: headerRowIdx }];

    // Light vertical border + zebra striping for readability.
    const lastRowIdx = ws.rowCount;
    for (let r = headerRowIdx + 1; r <= lastRowIdx; r++) {
      const row = ws.getRow(r);
      if (r % 2 === 0) {
        row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8F8F8' } };
      }
    }
  }
}
