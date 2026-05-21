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
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TpmService } from './tpm.service';

/**
 * TPM REST API.
 *
 * Hazard endpoints:   /tpm/hazard/*
 * OPL endpoints:      /tpm/opl/*
 * Master data:        /tpm/meta/*
 */
@Controller('tpm')
@UseGuards(AuthGuard('jwt'))
export class TpmController {
  constructor(private readonly svc: TpmService) {}

  // ── Master / Lookup ──────────────────────────────────────────────────────────

  @Get('meta/applications')
  applications() {
    return this.svc.getApplications();
  }

  @Get('meta/plants')
  plants() {
    return this.svc.getPlants();
  }

  @Get('meta/departments')
  departments(@Query('plantCode') plantCode?: string) {
    return this.svc.getPlantDepts(plantCode);
  }

  @Get('meta/hazard-categories')
  hazardCategories(@Query('hazardId') hazardId?: string) {
    return this.svc.getHazardCategories(hazardId ? +hazardId : undefined);
  }

  @Get('meta/hazard-sub-categories')
  hazardSubCategories(@Query('categoryId') categoryId?: string) {
    return this.svc.getHazardSubCategories(categoryId ? +categoryId : undefined);
  }

  @Get('meta/hazard-impacts')
  hazardImpacts() {
    return this.svc.getHazardImpacts();
  }

  @Get('meta/hazard-audit-types')
  hazardAuditTypes() {
    return this.svc.getHazardAuditTypes();
  }

  @Get('meta/opl-pillars')
  oplPillars() {
    return this.svc.getOplPillars();
  }

  @Get('meta/opl-topics')
  oplTopics(@Query('pillarId') pillarId?: string) {
    return this.svc.getOplTopics(pillarId ? +pillarId : undefined);
  }

  @Get('meta/opl-themes')
  oplThemes() {
    return this.svc.getOplThemes();
  }

  // ── Hazard ────────────────────────────────────────────────────────────────────

  @Get('hazard')
  listHazards(
    @Query('userId') userId?: string,
    @Query('plantId') plantId?: string,
    @Query('applicationId') applicationId?: string,
    @Query('status') status?: string,
    @Query('all') all?: string,
  ) {
    return this.svc.listHazards({
      userId: userId ? +userId : undefined,
      plantId: plantId ? +plantId : undefined,
      applicationId: applicationId ? +applicationId : undefined,
      status,
      all: all === '1',
    });
  }

  @Get('hazard/:id')
  getHazard(@Param('id', ParseIntPipe) id: number) {
    return this.svc.getHazard(id);
  }

  @Post('hazard')
  createHazard(@Body() body: any) {
    return this.svc.createHazard(body);
  }

  @Post('hazard/:id/timeline')
  postTimeline(@Param('id', ParseIntPipe) requestId: number, @Body() body: any) {
    return this.svc.postTimeline({ ...body, requestId });
  }

  @Put('hazard/:id/status')
  updateHazardStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { status: string; adminRemark?: string },
  ) {
    return this.svc.updateHazardStatus(id, body.status, body.adminRemark);
  }

  @Delete('hazard/:id')
  deleteHazard(@Param('id', ParseIntPipe) id: number) {
    return this.svc.deleteHazard(id);
  }

  // ── OPL ──────────────────────────────────────────────────────────────────────

  @Get('opl')
  listOpl(
    @Query('userId') userId?: string,
    @Query('plantId') plantId?: string,
    @Query('applicationId') applicationId?: string,
    @Query('status') status?: string,
    @Query('all') all?: string,
    @Query('isDraft') isDraft?: string,
  ) {
    return this.svc.listOpl({
      userId: userId ? +userId : undefined,
      plantId: plantId ? +plantId : undefined,
      applicationId: applicationId ? +applicationId : undefined,
      status,
      all: all === '1',
      isDraft: isDraft === '1' ? true : isDraft === '0' ? false : undefined,
    });
  }

  @Get('opl/:id')
  getOpl(@Param('id', ParseIntPipe) id: number) {
    return this.svc.getOpl(id);
  }

  @Post('opl')
  createOpl(@Body() body: any) {
    return this.svc.createOpl(body);
  }

  @Put('opl/:id')
  updateOpl(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.svc.updateOpl(id, body);
  }

  @Post('opl/:id/submit')
  submitOpl(@Param('id', ParseIntPipe) id: number) {
    return this.svc.submitOpl(id);
  }

  @Post('opl/:id/action')
  actionOpl(@Param('id', ParseIntPipe) oplId: number, @Body() body: any) {
    return this.svc.actionOpl({ ...body, oplId });
  }

  @Delete('opl/:id')
  deleteOpl(@Param('id', ParseIntPipe) id: number) {
    return this.svc.deleteOpl(id);
  }

  // ── Escalation (internal) ────────────────────────────────────────────────────

  @Get('escalation/hazard')
  hazardsForEscalation(@Query('daysOverdue') daysOverdue?: string) {
    const days = parseInt(daysOverdue ?? '3', 10) as 3 | 7 | 28;
    return this.svc.hazardsForEscalation(days);
  }
}
