import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { ReportService } from './report.service';

/**
 * Excel report download endpoints.
 * Each endpoint streams a .xlsx file directly to the client.
 */
@Controller('reports')
@UseGuards(AuthGuard('jwt'))
export class ReportController {
  constructor(private readonly svc: ReportService) {}

  @Get('training')
  async training(
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('type') trainingType?: string,
    @Query('createdBy') createdBy?: string,
    @Res() res?: Response,
  ) {
    const buf = await this.svc.trainingReport({
      from,
      to,
      trainingType,
      createdBy: createdBy ? +createdBy : undefined,
    });
    sendExcel(res!, buf, `training-${dateTag()}.xlsx`);
  }

  @Get('kaizen')
  async kaizen(
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('departmentId') departmentId?: string,
    @Query('status') status?: string,
    @Res() res?: Response,
  ) {
    const buf = await this.svc.kaizenReport({
      from,
      to,
      departmentId: departmentId ? +departmentId : undefined,
      status,
    });
    sendExcel(res!, buf, `kaizen-${dateTag()}.xlsx`);
  }

  @Get('oee')
  async oee(
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('departmentId') departmentId?: string,
    @Query('sectionId') sectionId?: string,
    @Res() res?: Response,
  ) {
    const buf = await this.svc.oeeReport({
      from,
      to,
      departmentId: departmentId ? +departmentId : undefined,
      sectionId: sectionId ? +sectionId : undefined,
    });
    sendExcel(res!, buf, `oee-${dateTag()}.xlsx`);
  }

  @Get('mpsheet')
  async mpsheet(
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('status') status?: string,
    @Query('plantId') plantId?: string,
    @Res() res?: Response,
  ) {
    const buf = await this.svc.mpsheetReport({
      from,
      to,
      status,
      plantId: plantId ? +plantId : undefined,
    });
    sendExcel(res!, buf, `mpsheet-${dateTag()}.xlsx`);
  }

  @Get('visitors')
  async visitors(
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('locationId') locationId?: string,
    @Res() res?: Response,
  ) {
    const buf = await this.svc.visitorReport({
      from,
      to,
      locationId: locationId ? +locationId : undefined,
    });
    sendExcel(res!, buf, `visitors-${dateTag()}.xlsx`);
  }
}

function sendExcel(res: Response, buf: Buffer, filename: string) {
  res.set({
    'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'Content-Disposition': `attachment; filename="${filename}"`,
    'Content-Length': buf.length,
  });
  res.end(buf);
}

function dateTag(): string {
  return new Date().toISOString().slice(0, 10);
}
