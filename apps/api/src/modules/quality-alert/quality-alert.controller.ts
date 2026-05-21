import {
  Body, Controller, Delete, Get, Param, ParseIntPipe,
  Post, Put, Query, Req, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { QualityAlertService } from './quality-alert.service';

@Controller('quality-alert')
@UseGuards(AuthGuard('jwt'))
export class QualityAlertController {
  constructor(private readonly svc: QualityAlertService) {}

  // ── Requests ──────────────────────────────────────────────────────────────

  @Get('requests')
  listRequests(
    @Query('departmentId') departmentId?: string,
    @Query('plantId') plantId?: string,
    @Query('status') status?: string,
    @Query('all') all?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Req() req?: any,
  ) {
    return this.svc.listRequests({
      departmentId: departmentId ? +departmentId : undefined,
      plantId: plantId ? +plantId : undefined,
      status,
      all: all === '1',
      createdBy: req?.user?.id,
      page: page ? +page : undefined,
      pageSize: pageSize ? +pageSize : undefined,
    });
  }

  @Get('requests/subdepartments')
  subdepartments() {
    return this.svc.subdepartments();
  }

  @Get('requests/:id')
  getRequest(@Param('id', ParseIntPipe) id: number) {
    return this.svc.getRequest(id);
  }

  @Post('requests')
  createRequest(@Body() body: any, @Req() req: any) {
    return this.svc.createRequest({ ...body, createdBy: body.createdBy ?? req.user.id });
  }

  @Put('requests/:id')
  updateRequest(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.svc.updateRequest(id, body);
  }

  @Delete('requests/:id')
  deleteRequest(@Param('id', ParseIntPipe) id: number) {
    return this.svc.deleteRequest(id);
  }

  // ── Timeline ──────────────────────────────────────────────────────────────

  @Post('requests/:id/timeline')
  addTimeline(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { actionType?: string; remark?: string },
    @Req() req: any,
  ) {
    return this.svc.addTimeline({ requestId: id, ...body, userId: req.user.id });
  }

  // ── Attachments ───────────────────────────────────────────────────────────

  @Post('requests/:id/attachments')
  addAttachment(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { file: string; timelineId?: number },
  ) {
    return this.svc.addAttachment({ requestId: id, ...body });
  }
}
