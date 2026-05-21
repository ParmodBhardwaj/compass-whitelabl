import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { KaizenService } from './kaizen.service';
import { ExcelService } from '../../common/excel/excel.service';
import { reportTitle } from '../../common/brand';

@Controller('kaizen')
@UseGuards(AuthGuard('jwt'))
export class KaizenController {
  constructor(
    private readonly svc: KaizenService,
    private readonly excel: ExcelService,
  ) {}

  /** Excel export of the kaizen list. Same filters as the `GET /kaizen` list. */
  @Get('reports/list.xlsx')
  async listXlsx(
    @Res() res: Response,
    @Query('userId') userId?: string,
    @Query('pillarId') pillarId?: string,
    @Query('status') status?: string,
    @Query('all') all?: string,
  ) {
    const rows = (await this.svc.listKaizens({
      userId: userId ? +userId : undefined,
      pillarId: pillarId ? +pillarId : undefined,
      status,
      all: all === '1',
    })) as any[];
    const buffer = await this.excel.sheet({
      name: 'Kaizens',
      title: reportTitle('Kaizen Report'),
      columns: [
        { header: 'Kaizen No',  key: 'kaizenNo',      width: 14 },
        { header: 'Title',      key: 'title',         width: 32 },
        { header: 'Pillar',     key: 'pillarId',      width: 10 },
        { header: 'Category',   key: 'category',      width: 10 },
        { header: 'Type',       key: 'type',          width: 14 },
        { header: 'Saving Type',key: 'savingType',    width: 14 },
        { header: 'Saving (₹)', key: 'totalSaving',   width: 14, format: v => Number(v ?? 0).toFixed(2) },
        { header: 'Status',     key: 'currentStatus', width: 14 },
        { header: 'Post Status',key: 'postStatus',    width: 14 },
        { header: 'Created',    key: 'createdAt',     width: 16, format: v => v ? new Date(v).toISOString().slice(0, 10) : '' },
      ],
      rows: rows.map((r) => (r.toJSON ? r.toJSON() : r)),
    });
    res.set({
      'Content-Type': ExcelService.MIME,
      'Content-Disposition': `attachment; filename="kaizens-${Date.now()}.xlsx"`,
    });
    res.send(buffer);
  }

  // ── Master data ──────────────────────────────────────────────────────────────

  @Get('meta/pillars')
  pillars() {
    return this.svc.getPillars();
  }

  @Get('meta/sections')
  sections(@Query('locationId') locationId?: string) {
    return this.svc.getSections(locationId ? +locationId : undefined);
  }

  @Get('meta/losses')
  losses() {
    return this.svc.getLosses();
  }

  @Get('meta/machines')
  machines() {
    return this.svc.getMachines();
  }

  @Get('meta/misc')
  misc() {
    return this.svc.getMisc();
  }

  @Get('meta/plants')
  plants() {
    return this.svc.getPlants();
  }

  // ── Kaizens ──────────────────────────────────────────────────────────────────

  @Get()
  list(
    @Query('userId') userId?: string,
    @Query('pillarId') pillarId?: string,
    @Query('status') status?: string,
    @Query('draft') draft?: string,
    @Query('all') all?: string,
  ) {
    return this.svc.listKaizens({
      userId: userId ? +userId : undefined,
      pillarId: pillarId ? +pillarId : undefined,
      status,
      draft,
      all: all === '1',
    });
  }

  @Get('stats')
  stats(@Query('userId') userId?: string) {
    return this.svc.stats(userId ? +userId : undefined);
  }

  @Get(':id')
  detail(@Param('id', ParseIntPipe) id: number) {
    return this.svc.getKaizen(id);
  }

  @Post()
  create(@Body() body: any) {
    return this.svc.createKaizen(body);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.svc.updateKaizen(id, body);
  }

  @Post(':id/submit')
  submit(@Param('id', ParseIntPipe) id: number, @Body() body: { userId: number }) {
    return this.svc.submitKaizen(id, body.userId);
  }

  @Post(':id/action')
  action(@Param('id', ParseIntPipe) kaizenId: number, @Body() body: any) {
    return this.svc.actionKaizen({ ...body, kaizenId });
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.svc.deleteKaizen(id);
  }
}
