import {
  Body, Controller, Delete, Get, Param, ParseIntPipe,
  Post, Put, Query, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { OeeService, OeeRequestDto } from './oee.service';

@Controller('oee')
@UseGuards(AuthGuard('jwt'))
export class OeeController {
  constructor(private readonly svc: OeeService) {}

  // ── Master data ──────────────────────────────────────────────────────────────

  @Get('departments')
  getDepartments(@Query('plantId') plantId?: string) {
    return this.svc.getDepartments(plantId ? +plantId : undefined);
  }

  @Get('sections')
  getSections(@Query('departmentId') departmentId?: string) {
    return this.svc.getSections(departmentId ? +departmentId : undefined);
  }

  @Get('lines')
  getLines(@Query('sectionId') sectionId?: string) {
    return this.svc.getLines(sectionId ? +sectionId : undefined);
  }

  @Get('machines')
  getMachines(@Query('lineId') lineId?: string) {
    return this.svc.getMachines(lineId ? +lineId : undefined);
  }

  @Get('groups')
  getGroups(@Query('sectionId') sectionId?: string) {
    return this.svc.getGroups(sectionId ? +sectionId : undefined);
  }

  @Get('groups/user/:userId')
  getGroupsForUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.svc.getGroupsForUser(userId);
  }

  // ── OEE Requests ─────────────────────────────────────────────────────────────

  @Get('requests')
  listRequests(
    @Query('createdBy') createdBy?: string,
    @Query('sectionId') sectionId?: string,
    @Query('lineId') lineId?: string,
    @Query('requestDate') requestDate?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('all') all?: string,
  ) {
    return this.svc.listRequests({
      createdBy: createdBy ? +createdBy : undefined,
      sectionId: sectionId ? +sectionId : undefined,
      lineId: lineId ? +lineId : undefined,
      requestDate,
      from,
      to,
      all: all === '1',
    });
  }

  @Get('requests/:id')
  getRequest(@Param('id', ParseIntPipe) id: number) {
    return this.svc.getRequest(id);
  }

  @Post('requests')
  createRequest(@Body() dto: OeeRequestDto) {
    return this.svc.createRequest(dto);
  }

  @Put('requests/:id')
  updateRequest(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<OeeRequestDto>,
  ) {
    return this.svc.updateRequest(id, dto);
  }

  @Delete('requests/:id')
  deleteRequest(@Param('id', ParseIntPipe) id: number) {
    return this.svc.deleteRequest(id);
  }

  // ── Aggregated data ─────────────────────────────────────────────────────────

  @Get('monthly/group')
  monthlyGroupData(
    @Query('groupId', ParseIntPipe) groupId: number,
    @Query('year', ParseIntPipe) year: number,
    @Query('month', ParseIntPipe) month: number,
  ) {
    return this.svc.monthlyGroupData(groupId, year, month);
  }

  @Get('monthly/section')
  monthlySectionData(
    @Query('sectionId', ParseIntPipe) sectionId: number,
    @Query('year', ParseIntPipe) year: number,
    @Query('month', ParseIntPipe) month: number,
  ) {
    return this.svc.monthlySectionData(sectionId, year, month);
  }

  // ── Phenomena / Model ────────────────────────────────────────────────────────

  @Get('requests/:id/phenomena')
  getPhenomenaForRequest(@Param('id', ParseIntPipe) id: number) {
    return this.svc.getPhenomenaForRequest(id);
  }

  @Get('requests/:id/model')
  getModelForRequest(@Param('id', ParseIntPipe) id: number) {
    return this.svc.getModelForRequest(id);
  }
}
