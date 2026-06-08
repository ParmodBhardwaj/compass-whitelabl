import {
  Body, Controller, Get, Param, ParseIntPipe,
  Post, Put, Query, Req, Res, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { VisitorsService, AppointmentDto } from './visitors.service';
import { ExcelService } from '../../common/excel/excel.service';
import { reportTitle } from '../../common/brand';

@Controller('visitors')
@UseGuards(AuthGuard('jwt'))
export class VisitorsController {
  constructor(
    private readonly svc: VisitorsService,
    private readonly excel: ExcelService,
  ) {}

  /** Excel export of appointments — admin/IA report. */
  @Get('reports/appointments.xlsx')
  async appointmentsXlsx(
    @Res() res: Response,
    @Query('contactPerson') contactPerson?: string,
    @Query('locationId') locationId?: string,
    @Query('status') status?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('all') all?: string,
  ) {
    const rows = (await this.svc.listAppointments({
      contactPerson: contactPerson ? +contactPerson : undefined,
      locationId: locationId ? +locationId : undefined,
      status,
      from,
      to,
      all: all === '1',
    })) as any[];
    const buffer = await this.excel.sheet({
      name: 'Visitor Appointments',
      title: reportTitle('Visitor Gate Pass Report'),
      columns: [
        { header: 'Apt #',        key: 'id',                  width: 8 },
        { header: 'Company',      key: 'company',             width: 28 },
        { header: 'Purpose',      key: 'purposeOfVisit',      width: 28 },
        { header: 'Location',     key: 'visitorLocationId',   width: 10 },
        { header: 'Pass Type',    key: 'passType',            width: 10, format: v => String(v ?? '').toUpperCase() },
        { header: 'Status',       key: 'requestStatus',       width: 12, format: v => String(v ?? '').toUpperCase() },
        { header: 'Valid From',   key: 'validFromDate',       width: 14 },
        { header: 'Valid To',     key: 'validToDate',         width: 14 },
        { header: 'Barcode',      key: 'barcodeNumber',       width: 18 },
        { header: 'Created',      key: 'createdAt',           width: 18, format: v => v ? new Date(v).toISOString().slice(0, 16).replace('T', ' ') : '' },
      ],
      rows: rows.map((r) => (r.toJSON ? r.toJSON() : r)),
    });
    res.set({
      'Content-Type': ExcelService.MIME,
      'Content-Disposition': `attachment; filename="visitors-${Date.now()}.xlsx"`,
    });
    res.send(buffer);
  }

  @Get('locations')
  getLocations() {
    return this.svc.getLocations();
  }

  @Get('passes')
  getPasses(@Query('locationId') locationId?: string) {
    return this.svc.getPasses(locationId ? +locationId : undefined);
  }

  @Get('appointments')
  listAppointments(
    @Query('requestCreatedBy') requestCreatedBy?: string,
    @Query('contactPerson') contactPerson?: string,
    @Query('locationId') locationId?: string,
    @Query('status') status?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('all') all?: string,
  ) {
    return this.svc.listAppointments({
      requestCreatedBy,
      contactPerson: contactPerson ? +contactPerson : undefined,
      locationId: locationId ? +locationId : undefined,
      status,
      from,
      to,
      all: all === '1',
    });
  }

  @Get('stats')
  stats(@Query('contactPerson') contactPerson?: string) {
    return this.svc.stats({ contactPerson: contactPerson ? +contactPerson : undefined });
  }

  /**
   * Today's pending appointments for the right-hand sidebar of Add Appointment.
   * Legacy: `$todayAppointments` in AppointmentController::addAction.
   */
  @Get('appointments/today/pending')
  todayPending(
    @Req() req: any,
    @Query('locationId') locationId?: string,
    @Query('mine') mine?: string,
  ) {
    return this.svc.todayPendingAppointments(
      mine === '1' ? req.user?.id : undefined,
      locationId ? +locationId : undefined,
    );
  }

  /** Visitors Pending for Card — approved appts where no check-in yet. */
  @Get('appointments/pending-card')
  pendingForCard(
    @Req() req: any,
    @Query('locationId') locationId?: string,
    @Query('all') all?: string,
  ) {
    return this.svc.pendingForCard({
      contactPerson: req.user?.id,
      locationId: locationId ? +locationId : undefined,
      all: all === '1',
    });
  }

  /** Visitors Pending for Checkout — checked in, not checked out. */
  @Get('appointments/pending-checkout')
  pendingForCheckout(
    @Req() req: any,
    @Query('locationId') locationId?: string,
    @Query('all') all?: string,
  ) {
    return this.svc.pendingForCheckout({
      contactPerson: req.user?.id,
      locationId: locationId ? +locationId : undefined,
      all: all === '1',
    });
  }

  /** Pending-for-Approval inbox for the logged-in employee. */
  @Get('appointments/pending-approval')
  pendingForApproval(
    @Req() req: any,
    @Query('locationId') locationId?: string,
  ) {
    return this.svc.pendingForApproval(req.user?.id, {
      locationId: locationId ? +locationId : undefined,
    });
  }

  @Get('appointments/:id')
  getAppointment(@Param('id', ParseIntPipe) id: number) {
    return this.svc.getAppointment(id);
  }

  @Post('appointments')
  createAppointment(@Body() dto: AppointmentDto) {
    return this.svc.createAppointment(dto);
  }

  @Put('appointments/:id/approve')
  approveAppointment(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { approverId: number; approved: boolean; remarks?: string },
  ) {
    return this.svc.approveAppointment(id, body.approverId, body.approved, body.remarks);
  }

  @Put('appointments/:id/cancel')
  cancelAppointment(@Param('id', ParseIntPipe) id: number) {
    return this.svc.cancelAppointment(id);
  }

  @Get('batches')
  listBatches(@Query('locationId') locationId?: string) {
    return this.svc.listBatches(locationId ? +locationId : undefined);
  }

  /** Frequent visitors for the logged-in user (grouped by mobile). */
  @Get('frequent')
  frequent(@Req() req: any, @Query('limit') limit?: string) {
    return this.svc.listFrequentVisitors(req.user.id, limit ? +limit : 50);
  }

  /** Approval members list for a given location & pass type. */
  @Get('approval-members')
  approvalMembers(
    @Query('locationId', ParseIntPipe) locationId: number,
    @Query('passType') passType?: string,
  ) {
    return this.svc.listApprovalMembers(locationId, passType);
  }

  /** Printable gate-pass payload for an appointment. */
  @Get('appointments/:id/gate-pass')
  gatePass(@Param('id', ParseIntPipe) id: number) {
    return this.svc.gatePass(id);
  }

  /** Pending employee-feedback inbox. */
  @Get('feedback/pending')
  pendingFeedback(@Req() req: any) {
    return this.svc.pendingEmployeeFeedback(req.user.id);
  }

  @Post('appointments/:id/feedback')
  submitFeedback(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { rating: number; comment?: string },
  ) {
    return this.svc.submitEmployeeFeedback(id, body.rating, body.comment);
  }

  @Put('visitors/:vid/checkout')
  checkout(@Param('vid', ParseIntPipe) vid: number) {
    return this.svc.checkoutVisitor(vid);
  }
}
