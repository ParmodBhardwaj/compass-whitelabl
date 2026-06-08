import {
  Body, Controller, Delete, Get, Param, ParseIntPipe,
  Post, Put, Query, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { VisitorsAdminService } from './visitors-admin.service';

/**
 * Visitor admin CRUD endpoints. Mounted under /v2/visitors/admin/* so the
 * routes don't collide with the user-facing VisitorsController.
 *
 * Each resource exposes the standard MasterDataPanel quartet:
 *   GET    /v2/visitors/admin/<resource>
 *   POST   /v2/visitors/admin/<resource>
 *   PUT    /v2/visitors/admin/<resource>/:id
 *   DELETE /v2/visitors/admin/<resource>/:id
 */
@Controller('visitors/admin')
@UseGuards(AuthGuard('jwt'))
export class VisitorsAdminController {
  constructor(private readonly svc: VisitorsAdminService) {}

  // ── Locations ──────────────────────────────────────────────────────────
  @Get('locations')                       listLocations() { return this.svc.listLocations(); }
  @Post('locations')                      createLocation(@Body() b: any) { return this.svc.createLocation(b); }
  @Put('locations/:id')                   updateLocation(@Param('id', ParseIntPipe) id: number, @Body() b: any) { return this.svc.updateLocation(id, b); }
  @Delete('locations/:id')                deleteLocation(@Param('id', ParseIntPipe) id: number) { return this.svc.deleteLocation(id); }

  // ── Instructions ───────────────────────────────────────────────────────
  @Get('instructions')                    listInstructions(@Query('locationId') locationId?: string) { return this.svc.listInstructions(locationId ? +locationId : undefined); }
  @Post('instructions')                   createInstruction(@Body() b: any) { return this.svc.createInstruction(b); }
  @Put('instructions/:id')                updateInstruction(@Param('id', ParseIntPipe) id: number, @Body() b: any) { return this.svc.updateInstruction(id, b); }
  @Delete('instructions/:id')             deleteInstruction(@Param('id', ParseIntPipe) id: number) { return this.svc.deleteInstruction(id); }

  // ── Approval Members ───────────────────────────────────────────────────
  @Get('approval-members')                listApprovalMembers(@Query('locationId') locationId?: string) { return this.svc.listApprovalMembers(locationId ? +locationId : undefined); }
  @Post('approval-members')               createApprovalMember(@Body() b: any) { return this.svc.createApprovalMember(b); }
  @Put('approval-members/:id')            updateApprovalMember(@Param('id', ParseIntPipe) id: number, @Body() b: any) { return this.svc.updateApprovalMember(id, b); }
  @Delete('approval-members/:id')         deleteApprovalMember(@Param('id', ParseIntPipe) id: number) { return this.svc.deleteApprovalMember(id); }

  // ── Disabled Fields ────────────────────────────────────────────────────
  @Get('disabled-fields')                 listDisabledFields(@Query('locationId') locationId?: string) { return this.svc.listDisabledFields(locationId ? +locationId : undefined); }
  @Post('disabled-fields')                createDisabledField(@Body() b: any) { return this.svc.createDisabledField(b); }
  @Put('disabled-fields/:id')             updateDisabledField(@Param('id', ParseIntPipe) id: number, @Body() b: any) { return this.svc.updateDisabledField(id, b); }
  @Delete('disabled-fields/:id')          deleteDisabledField(@Param('id', ParseIntPipe) id: number) { return this.svc.deleteDisabledField(id); }

  // ── Security Members ───────────────────────────────────────────────────
  @Get('security-members')                listSecurityMembers(@Query('locationId') locationId?: string) { return this.svc.listSecurityMembers(locationId ? +locationId : undefined); }
  @Post('security-members')               createSecurityMember(@Body() b: any) { return this.svc.createSecurityMember(b); }
  @Put('security-members/:id')            updateSecurityMember(@Param('id', ParseIntPipe) id: number, @Body() b: any) { return this.svc.updateSecurityMember(id, b); }
  @Delete('security-members/:id')         deleteSecurityMember(@Param('id', ParseIntPipe) id: number) { return this.svc.deleteSecurityMember(id); }

  // ── Canteen Members ────────────────────────────────────────────────────
  @Get('canteen-members')                 listCanteenMembers(@Query('locationId') locationId?: string) { return this.svc.listCanteenMembers(locationId ? +locationId : undefined); }
  @Post('canteen-members')                createCanteenMember(@Body() b: any) { return this.svc.createCanteenMember(b); }
  @Put('canteen-members/:id')             updateCanteenMember(@Param('id', ParseIntPipe) id: number, @Body() b: any) { return this.svc.updateCanteenMember(id, b); }
  @Delete('canteen-members/:id')          deleteCanteenMember(@Param('id', ParseIntPipe) id: number) { return this.svc.deleteCanteenMember(id); }

  // ── Reception Members ──────────────────────────────────────────────────
  @Get('reception-members')               listReceptionMembers(@Query('locationId') locationId?: string) { return this.svc.listReceptionMembers(locationId ? +locationId : undefined); }
  @Post('reception-members')              createReceptionMember(@Body() b: any) { return this.svc.createReceptionMember(b); }
  @Put('reception-members/:id')           updateReceptionMember(@Param('id', ParseIntPipe) id: number, @Body() b: any) { return this.svc.updateReceptionMember(id, b); }
  @Delete('reception-members/:id')        deleteReceptionMember(@Param('id', ParseIntPipe) id: number) { return this.svc.deleteReceptionMember(id); }

  // ── Feedback Location-Department mapping ───────────────────────────────
  @Get('feedback-location-dept')          listFeedbackLocDept(@Query('locationId') locationId?: string) { return this.svc.listFeedbackLocationDept(locationId ? +locationId : undefined); }
  @Post('feedback-location-dept')         createFeedbackLocDept(@Body() b: any) { return this.svc.createFeedbackLocationDept(b); }
  @Put('feedback-location-dept/:id')      updateFeedbackLocDept(@Param('id', ParseIntPipe) id: number, @Body() b: any) { return this.svc.updateFeedbackLocationDept(id, b); }
  @Delete('feedback-location-dept/:id')   deleteFeedbackLocDept(@Param('id', ParseIntPipe) id: number) { return this.svc.deleteFeedbackLocationDept(id); }

  // ── Feedback Questions (visitor / employee filter via ?type=) ──────────
  @Get('feedback-questions')              listFeedbackQuestions(@Query('type') type?: 'visitor' | 'employee') { return this.svc.listFeedbackQuestions(type); }
  @Post('feedback-questions')             createFeedbackQuestion(@Body() b: any) { return this.svc.createFeedbackQuestion(b); }
  @Put('feedback-questions/:id')          updateFeedbackQuestion(@Param('id', ParseIntPipe) id: number, @Body() b: any) { return this.svc.updateFeedbackQuestion(id, b); }
  @Delete('feedback-questions/:id')       deleteFeedbackQuestion(@Param('id', ParseIntPipe) id: number) { return this.svc.deleteFeedbackQuestion(id); }

  // ── Visitor Pass Types ─────────────────────────────────────────────────
  @Get('passes')                          listPasses(@Query('locationId') locationId?: string) { return this.svc.listVisitorPasses(locationId ? +locationId : undefined); }
  @Post('passes')                         createPass(@Body() b: any) { return this.svc.createVisitorPass(b); }
  @Put('passes/:id')                      updatePass(@Param('id', ParseIntPipe) id: number, @Body() b: any) { return this.svc.updateVisitorPass(id, b); }
  @Delete('passes/:id')                   deletePass(@Param('id', ParseIntPipe) id: number) { return this.svc.deleteVisitorPass(id); }

  // ── Grades for Red Pass ────────────────────────────────────────────────
  @Get('grades')                          listGrades(@Query('locationId') locationId?: string) { return this.svc.listLocationGrades(locationId ? +locationId : undefined); }
  @Post('grades')                         createGrade(@Body() b: any) { return this.svc.createLocationGrade(b); }
  @Put('grades/:id')                      updateGrade(@Param('id', ParseIntPipe) id: number, @Body() b: any) { return this.svc.updateLocationGrade(id, b); }
  @Delete('grades/:id')                   deleteGrade(@Param('id', ParseIntPipe) id: number) { return this.svc.deleteLocationGrade(id); }
}
