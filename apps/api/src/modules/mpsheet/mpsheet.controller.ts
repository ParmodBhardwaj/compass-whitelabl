import {
  Body, Controller, Delete, Get, Param, ParseIntPipe,
  Post, Put, Query, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MpsheetService, MpRequestDto } from './mpsheet.service';

@Controller('mpsheet')
@UseGuards(AuthGuard('jwt'))
export class MpsheetController {
  constructor(private readonly svc: MpsheetService) {}

  // ── Master data ──────────────────────────────────────────────────────────────

  @Get('classifications')
  getClassifications() {
    return this.svc.getClassifications();
  }

  @Get('approvers')
  getApprovers(
    @Query('plantId') plantId?: string,
    @Query('type') type?: string,
  ) {
    return this.svc.getApprovers(plantId ? +plantId : undefined, type);
  }

  // ── Requests ─────────────────────────────────────────────────────────────────

  @Get('requests')
  listRequests(
    @Query('createdBy') createdBy?: string,
    @Query('plantId') plantId?: string,
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('all') all?: string,
  ) {
    return this.svc.listRequests({
      createdBy: createdBy ? +createdBy : undefined,
      plantId: plantId ? +plantId : undefined,
      type,
      status,
      from,
      to,
      all: all === '1',
    });
  }

  @Get('stats')
  stats(
    @Query('createdBy') createdBy?: string,
    @Query('plantId') plantId?: string,
  ) {
    return this.svc.stats({
      createdBy: createdBy ? +createdBy : undefined,
      plantId: plantId ? +plantId : undefined,
    });
  }

  @Get('requests/:id')
  getRequest(@Param('id', ParseIntPipe) id: number) {
    return this.svc.getRequest(id);
  }

  @Post('requests')
  createRequest(@Body() dto: MpRequestDto) {
    return this.svc.createRequest(dto);
  }

  @Put('requests/:id')
  updateRequest(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<MpRequestDto>,
  ) {
    return this.svc.updateRequest(id, dto);
  }

  @Delete('requests/:id')
  deleteRequest(@Param('id', ParseIntPipe) id: number) {
    return this.svc.deleteRequest(id);
  }

  // ── Timeline / Workflow ──────────────────────────────────────────────────────

  @Post('requests/:id/action')
  postAction(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { userId: number; actionType: string; remark?: string },
  ) {
    return this.svc.postAction({
      requestId: id,
      userId: body.userId,
      actionType: body.actionType,
      remark: body.remark,
    });
  }
}
