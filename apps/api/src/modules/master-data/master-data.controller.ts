import {
  Body, Controller, Delete, Get, Param, ParseIntPipe,
  Post, Put, Query, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MasterDataService } from './master-data.service';

/**
 * Master-data CRUD endpoints — backs the small admin pages for legacy
 * routes /admin/department, /admin/location, /admin/setting.
 */
@Controller()
@UseGuards(AuthGuard('jwt'))
export class MasterDataController {
  constructor(private readonly svc: MasterDataService) {}

  // ── Departments ───────────────────────────────────────────────────────

  @Get('departments')
  listDepartments(@Query('q') q?: string, @Query('all') all?: string) {
    return this.svc.listDepartments({ q, includeDeleted: all === '1' });
  }

  @Post('departments')
  createDepartment(@Body() body: any) {
    return this.svc.createDepartment(body);
  }

  @Put('departments/:id')
  updateDepartment(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.svc.updateDepartment(id, body);
  }

  @Delete('departments/:id')
  deleteDepartment(@Param('id', ParseIntPipe) id: number) {
    return this.svc.deleteDepartment(id);
  }

  // ── Locations ─────────────────────────────────────────────────────────

  @Get('locations')
  listLocations(@Query('q') q?: string) {
    return this.svc.listLocations({ q });
  }

  @Post('locations')
  createLocation(@Body() body: { locationText: string; location: string }) {
    return this.svc.createLocation(body);
  }

  @Put('locations/:id')
  updateLocation(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.svc.updateLocation(id, body);
  }

  @Delete('locations/:id')
  deleteLocation(@Param('id', ParseIntPipe) id: number) {
    return this.svc.deleteLocation(id);
  }

  // ── Settings ──────────────────────────────────────────────────────────

  @Get('settings')
  listSettings(
    @Query('group') settingGroup?: string,
    @Query('storeId') storeId?: string,
    @Query('q') q?: string,
  ) {
    return this.svc.listSettings({
      settingGroup,
      storeId: storeId ? +storeId : undefined,
      q,
    });
  }

  @Post('settings')
  createSetting(@Body() body: any) {
    return this.svc.createSetting(body);
  }

  @Put('settings/:id')
  updateSetting(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.svc.updateSetting(id, body);
  }

  @Delete('settings/:id')
  deleteSetting(@Param('id', ParseIntPipe) id: number) {
    return this.svc.deleteSetting(id);
  }

  // ── Meeting Documents ────────────────────────────────────────────────

  @Get('meeting-documents')
  listMeetingDocs(@Query('docType') docType: 'doc' | 'summary' = 'doc', @Query('q') q?: string) {
    return this.svc.listMeetingDocuments({ docType, q });
  }

  @Post('meeting-documents')
  createMeetingDoc(@Body() body: any) {
    return this.svc.createMeetingDocument(body);
  }

  @Put('meeting-documents/:id')
  updateMeetingDoc(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.svc.updateMeetingDocument(id, body);
  }

  @Delete('meeting-documents/:id')
  deleteMeetingDoc(@Param('id', ParseIntPipe) id: number) {
    return this.svc.deleteMeetingDocument(id);
  }

  // ── Training / Finance / MPSheet categories ──────────────────────────

  @Get('categories')
  listCategories(
    @Query('type') type: 'training' | 'finance' | 'mpsheet' = 'training',
    @Query('q') q?: string,
  ) {
    return this.svc.listCategories({ type, q });
  }

  @Post('categories')
  createCategory(@Body() body: any) {
    return this.svc.createCategory(body);
  }

  @Put('categories/:id')
  updateCategory(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.svc.updateCategory(id, body);
  }

  @Delete('categories/:id')
  deleteCategory(@Param('id', ParseIntPipe) id: number) {
    return this.svc.deleteCategory(id);
  }

  // ── Sub-categories ───────────────────────────────────────────────────

  @Get('sub-categories')
  listSubCategories(
    @Query('type') type: 'training' = 'training',
    @Query('categoryId') categoryId?: string,
    @Query('q') q?: string,
  ) {
    return this.svc.listSubCategories({
      type,
      categoryId: categoryId ? +categoryId : undefined,
      q,
    });
  }

  @Post('sub-categories')
  createSubCategory(@Body() body: any) {
    return this.svc.createSubCategory(body);
  }

  @Put('sub-categories/:id')
  updateSubCategory(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.svc.updateSubCategory(id, body);
  }

  @Delete('sub-categories/:id')
  deleteSubCategory(@Param('id', ParseIntPipe) id: number) {
    return this.svc.deleteSubCategory(id);
  }

  // ── Login usage report ───────────────────────────────────────────────

  @Get('login-usage')
  loginUsage(
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('limit') limit?: string,
  ) {
    return this.svc.loginUsageReport({
      from,
      to,
      limit: limit ? +limit : undefined,
    });
  }

  // ── REST API users ───────────────────────────────────────────────────

  @Get('api-users')
  listApiUsers(@Query('q') q?: string) {
    return this.svc.listApiUsers({ q });
  }

  @Post('api-users')
  createApiUser(@Body() body: { title: string; username: string; password: string; status?: '0'|'1' }) {
    return this.svc.createApiUser(body);
  }

  @Put('api-users/:id')
  updateApiUser(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.svc.updateApiUser(id, body);
  }

  @Delete('api-users/:id')
  deleteApiUser(@Param('id', ParseIntPipe) id: number) {
    return this.svc.deleteApiUser(id);
  }

  // ── Landing images ───────────────────────────────────────────────────

  @Get('landing-images')
  listLandingImages() { return this.svc.listLandingImages(); }
  @Post('landing-images')
  createLandingImage(@Body() body: any) { return this.svc.createLandingImage(body); }
  @Put('landing-images/:id')
  updateLandingImage(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.svc.updateLandingImage(id, body);
  }
  @Delete('landing-images/:id')
  deleteLandingImage(@Param('id', ParseIntPipe) id: number) {
    return this.svc.deleteLandingImage(id);
  }

  // ── Upcoming banners ─────────────────────────────────────────────────

  @Get('upcoming-banners')
  listUpcomingBanners(@Query('storeId') storeId?: string, @Query('q') q?: string) {
    return this.svc.listUpcomingBanners({
      storeId: storeId ? +storeId : undefined,
      q,
    });
  }
  @Post('upcoming-banners')
  createUpcomingBanner(@Body() body: any) { return this.svc.createUpcomingBanner(body); }
  @Put('upcoming-banners/:id')
  updateUpcomingBanner(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.svc.updateUpcomingBanner(id, body);
  }
  @Delete('upcoming-banners/:id')
  deleteUpcomingBanner(@Param('id', ParseIntPipe) id: number) {
    return this.svc.deleteUpcomingBanner(id);
  }

  // ── Off-role employees ───────────────────────────────────────────────

  @Get('off-role-employees')
  listOffRoleEmployees(@Query('q') q?: string, @Query('limit') limit?: string) {
    return this.svc.listOffRoleEmployees({ q, limit: limit ? +limit : undefined });
  }

  // ── SOP Level 1 ──────────────────────────────────────────────────────

  @Get('sop/level1')
  listSopLevel1(@Query('q') q?: string) { return this.svc.listSopLevel1({ q }); }
  @Post('sop/level1')
  createSopLevel1(@Body() body: any) { return this.svc.createSopLevel1(body); }
  @Put('sop/level1/:id')
  updateSopLevel1(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.svc.updateSopLevel1(id, body);
  }
  @Delete('sop/level1/:id')
  deleteSopLevel1(@Param('id', ParseIntPipe) id: number) {
    return this.svc.deleteSopLevel1(id);
  }

  // ── SOP Sections ─────────────────────────────────────────────────────

  @Get('sop/sections')
  listSopSections(
    @Query('type') type?: 'ss&sc' | 'plant-operation',
    @Query('q') q?: string,
  ) {
    return this.svc.listSopSections({ type, q });
  }
  @Post('sop/sections')
  createSopSection(@Body() body: any) { return this.svc.createSopSection(body); }
  @Put('sop/sections/:id')
  updateSopSection(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.svc.updateSopSection(id, body);
  }
  @Delete('sop/sections/:id')
  deleteSopSection(@Param('id', ParseIntPipe) id: number) {
    return this.svc.deleteSopSection(id);
  }

  // ── SOP Processes (read-only) ────────────────────────────────────────

  @Get('sop/processes')
  listSopProcesses(
    @Query('sectionId') sectionId?: string,
    @Query('q') q?: string,
    @Query('limit') limit?: string,
  ) {
    return this.svc.listSopProcesses({
      sectionId: sectionId ? +sectionId : undefined,
      q,
      limit: limit ? +limit : undefined,
    });
  }

  // ── SOP Feedback ─────────────────────────────────────────────────────

  @Get('sop/feedback')
  listSopFeedback(@Query('q') q?: string) {
    return this.svc.listSopFeedback({ q });
  }
  @Put('sop/feedback/:id/reply')
  replySopFeedback(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { feedbackReply: string },
  ) {
    return this.svc.replySopFeedback(id, body.feedbackReply);
  }
  @Delete('sop/feedback/:id')
  deleteSopFeedback(@Param('id', ParseIntPipe) id: number) {
    return this.svc.deleteSopFeedback(id);
  }

  // ── SOP Activity Report ──────────────────────────────────────────────

  @Get('sop/activity-report')
  sopActivityReport(
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('userId') userId?: string,
    @Query('limit') limit?: string,
  ) {
    return this.svc.sopActivityReport({
      from,
      to,
      userId: userId ? +userId : undefined,
      limit: limit ? +limit : undefined,
    });
  }
}
