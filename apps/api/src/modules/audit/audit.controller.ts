import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { AuditService } from './audit.service';
import { ExcelService } from '../../common/excel/excel.service';

@Controller('audit')
export class AuditController {
  constructor(
    private readonly svc: AuditService,
    private readonly excel: ExcelService,
  ) {}

  @Get()
  list(@Query('userId', ParseIntPipe) userId: number, @Query('status') status?: 'open' | 'closed') {
    return this.svc.listForUser({ userId, status });
  }

  /** Excel export — every section with audit + status (admin/IA report). */
  @Get('reports/sections.xlsx')
  async sectionsXlsx(
    @Res() res: Response,
    @Query('auditId') auditId?: string,
    @Query('status') status?: string,
  ) {
    const rows = await this.svc.sectionsForExport({
      auditId: auditId ? +auditId : undefined,
      status,
    });
    const buffer = await this.excel.sheet({
      name: 'Audit Sections',
      title: 'Hero Compass — Audit Tracker Report',
      columns: [
        { header: 'Audit ID',          key: 'auditId',             width: 10 },
        { header: 'Audit',             key: 'auditName',           width: 28 },
        { header: 'Section ID',        key: 'sectionId',           width: 12 },
        { header: 'Section',           key: 'sectionName',         width: 30 },
        { header: 'Observation',       key: 'observationDetail',   width: 50 },
        { header: 'Immediate Action',  key: 'immediateActionPlan', width: 40 },
        { header: 'Systematic Action', key: 'systematicActionPlan',width: 40 },
        { header: 'Risk',              key: 'riskRating',          width: 10, format: v => String(v ?? '').toUpperCase() },
        { header: 'Cutoff Date',       key: 'timeline',            width: 14 },
        { header: 'Status',            key: 'status',              width: 22 },
        { header: 'Process Owner',     key: 'processOwner',        width: 14 },
      ],
      rows,
    });
    res.set({
      'Content-Type': ExcelService.MIME,
      'Content-Disposition': `attachment; filename="audit-sections-${Date.now()}.xlsx"`,
    });
    res.send(buffer);
  }

  @Get(':id')
  detail(@Param('id', ParseIntPipe) id: number) {
    return this.svc.detail(id);
  }

  @Post('evidence')
  submitEvidence(@Body() body: any) {
    return this.svc.submitEvidence(body);
  }

  @Post('approve')
  approve(@Body() body: { timelineId: number; userId: number; role: 'ro' | 'fh' | 'ia' }) {
    return this.svc.approve(body);
  }

  @Post('resubmit')
  resubmit(@Body() body: { timelineId: number; userId: number; comment: string }) {
    return this.svc.resubmit(body);
  }

  @Post('revise')
  revise(@Body() body: any) {
    return this.svc.requestRevise(body);
  }

  @Get('meta/categories')
  categories() {
    return this.svc.categories();
  }

  @Get('meta/themes')
  themes() {
    return this.svc.themes();
  }
}
