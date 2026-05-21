import {
  Body, Controller, Delete, Get, Param, ParseIntPipe,
  Post, Put, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PortalDataService } from './portal-data.service';

/**
 * Per-portal admin CRUD endpoints. Each resource maps to a small admin page
 * driven by MasterDataPanel.
 */
@Controller()
@UseGuards(AuthGuard('jwt'))
export class PortalDataController {
  constructor(private readonly svc: PortalDataService) {}

  // Car Pool
  @Get('cp/locations')                       cpLocations()                                        { return this.svc.cpLocations(); }
  @Post('cp/locations')                      createCpLocation(@Body() b: any)                    { return this.svc.createCpLocation(b); }
  @Put('cp/locations/:id')                   updateCpLocation(@Param('id', ParseIntPipe) id: number, @Body() b: any) { return this.svc.updateCpLocation(id, b); }
  @Delete('cp/locations/:id')                deleteCpLocation(@Param('id', ParseIntPipe) id: number) { return this.svc.deleteCpLocation(id); }

  @Get('cp/rides')                           cpRides()                                            { return this.svc.cpRides(); }
  @Post('cp/rides')                          createCpRide(@Body() b: any)                        { return this.svc.createCpRide(b); }
  @Put('cp/rides/:id')                       updateCpRide(@Param('id', ParseIntPipe) id: number, @Body() b: any) { return this.svc.updateCpRide(id, b); }
  @Delete('cp/rides/:id')                    deleteCpRide(@Param('id', ParseIntPipe) id: number)  { return this.svc.deleteCpRide(id); }

  // Sale/Rent
  @Get('sale/categories')                    saleCategories()                                     { return this.svc.saleCategories(); }
  @Post('sale/categories')                   createSaleCategory(@Body() b: any)                  { return this.svc.createSaleCategory(b); }
  @Put('sale/categories/:id')                updateSaleCategory(@Param('id', ParseIntPipe) id: number, @Body() b: any) { return this.svc.updateSaleCategory(id, b); }
  @Delete('sale/categories/:id')             deleteSaleCategory(@Param('id', ParseIntPipe) id: number) { return this.svc.deleteSaleCategory(id); }

  // Idea Portal content
  @Get('idea/content')                       ideaContent()                                        { return this.svc.ideaContent(); }
  @Post('idea/content')                      createIdeaContent(@Body() b: any)                   { return this.svc.createIdeaContent(b); }
  @Put('idea/content/:id')                   updateIdeaContent(@Param('id', ParseIntPipe) id: number, @Body() b: any) { return this.svc.updateIdeaContent(id, b); }
  @Delete('idea/content/:id')                deleteIdeaContent(@Param('id', ParseIntPipe) id: number) { return this.svc.deleteIdeaContent(id); }

  // R&D — write-only (GET handled by RndController with proper filters)
  @Post('rnd/notices')                       createRndNotice(@Body() b: any)                     { return this.svc.createRndNotice(b); }
  @Put('rnd/notices/:id')                    updateRndNotice(@Param('id', ParseIntPipe) id: number, @Body() b: any) { return this.svc.updateRndNotice(id, b); }
  @Delete('rnd/notices/:id')                 deleteRndNotice(@Param('id', ParseIntPipe) id: number) { return this.svc.deleteRndNotice(id); }

  @Post('rnd/joinees')                       createRndJoinee(@Body() b: any)                     { return this.svc.createRndJoinee(b); }
  @Put('rnd/joinees/:id')                    updateRndJoinee(@Param('id', ParseIntPipe) id: number, @Body() b: any) { return this.svc.updateRndJoinee(id, b); }
  @Delete('rnd/joinees/:id')                 deleteRndJoinee(@Param('id', ParseIntPipe) id: number) { return this.svc.deleteRndJoinee(id); }

  @Post('rnd/competitor-products')           createRndCompetitor(@Body() b: any)                 { return this.svc.createRndCompetitor(b); }
  @Put('rnd/competitor-products/:id')        updateRndCompetitor(@Param('id', ParseIntPipe) id: number, @Body() b: any) { return this.svc.updateRndCompetitor(id, b); }
  @Delete('rnd/competitor-products/:id')     deleteRndCompetitor(@Param('id', ParseIntPipe) id: number) { return this.svc.deleteRndCompetitor(id); }

  // D&I — write-only (GET handled by DniController with proper filters)
  @Post('dni/events')                        createDniEvent(@Body() b: any)                      { return this.svc.createDniEvent(b); }
  @Put('dni/events/:id')                     updateDniEvent(@Param('id', ParseIntPipe) id: number, @Body() b: any) { return this.svc.updateDniEvent(id, b); }
  @Delete('dni/events/:id')                  deleteDniEvent(@Param('id', ParseIntPipe) id: number) { return this.svc.deleteDniEvent(id); }

  @Post('dni/initiatives')                   createDniInitiative(@Body() b: any)                 { return this.svc.createDniInitiative(b); }
  @Put('dni/initiatives/:id')                updateDniInitiative(@Param('id', ParseIntPipe) id: number, @Body() b: any) { return this.svc.updateDniInitiative(id, b); }
  @Delete('dni/initiatives/:id')             deleteDniInitiative(@Param('id', ParseIntPipe) id: number) { return this.svc.deleteDniInitiative(id); }

  @Post('dni/newsletters')                   createDniNewsletter(@Body() b: any)                 { return this.svc.createDniNewsletter(b); }
  @Put('dni/newsletters/:id')                updateDniNewsletter(@Param('id', ParseIntPipe) id: number, @Body() b: any) { return this.svc.updateDniNewsletter(id, b); }
  @Delete('dni/newsletters/:id')             deleteDniNewsletter(@Param('id', ParseIntPipe) id: number) { return this.svc.deleteDniNewsletter(id); }

  @Post('dni/videos')                        createDniVideo(@Body() b: any)                      { return this.svc.createDniVideo(b); }
  @Put('dni/videos/:id')                     updateDniVideo(@Param('id', ParseIntPipe) id: number, @Body() b: any) { return this.svc.updateDniVideo(id, b); }
  @Delete('dni/videos/:id')                  deleteDniVideo(@Param('id', ParseIntPipe) id: number) { return this.svc.deleteDniVideo(id); }

  @Post('dni/featured')                      createDniFeatured(@Body() b: any)                   { return this.svc.createDniFeatured(b); }
  @Put('dni/featured/:id')                   updateDniFeatured(@Param('id', ParseIntPipe) id: number, @Body() b: any) { return this.svc.updateDniFeatured(id, b); }
  @Delete('dni/featured/:id')                deleteDniFeatured(@Param('id', ParseIntPipe) id: number) { return this.svc.deleteDniFeatured(id); }

  // Quality Alert
  @Get('qa/subdepartments')                  qaSubdepts()                                         { return this.svc.qaSubdepartments(); }
  @Post('qa/subdepartments')                 createQaSubdept(@Body() b: any)                     { return this.svc.createQaSubdept(b); }
  @Put('qa/subdepartments/:id')              updateQaSubdept(@Param('id', ParseIntPipe) id: number, @Body() b: any) { return this.svc.updateQaSubdept(id, b); }
  @Delete('qa/subdepartments/:id')           deleteQaSubdept(@Param('id', ParseIntPipe) id: number) { return this.svc.deleteQaSubdept(id); }

  @Get('qa/initiators')                      qaInitiators()                                       { return this.svc.qaInitiators(); }
  @Post('qa/initiators')                     createQaInitiator(@Body() b: any)                   { return this.svc.createQaInitiator(b); }
  @Delete('qa/initiators/:id')               deleteQaInitiator(@Param('id', ParseIntPipe) id: number) { return this.svc.deleteQaInitiator(id); }

  @Get('qa/fi-users')                        qaFiUsers()                                          { return this.svc.qaFiUsers(); }
  @Post('qa/fi-users')                       createQaFiUser(@Body() b: any)                      { return this.svc.createQaFiUser(b); }
  @Delete('qa/fi-users/:id')                 deleteQaFiUser(@Param('id', ParseIntPipe) id: number) { return this.svc.deleteQaFiUser(id); }

  // OEE
  @Get('oee/lines')                          oeeLines()                                           { return this.svc.oeeLines(); }
  @Post('oee/lines')                         createOeeLine(@Body() b: any)                       { return this.svc.createOeeLine(b); }
  @Put('oee/lines/:id')                      updateOeeLine(@Param('id', ParseIntPipe) id: number, @Body() b: any) { return this.svc.updateOeeLine(id, b); }
  @Delete('oee/lines/:id')                   deleteOeeLine(@Param('id', ParseIntPipe) id: number) { return this.svc.deleteOeeLine(id); }

  @Get('oee/groups')                         oeeGroups()                                          { return this.svc.oeeGroups(); }
  @Post('oee/groups')                        createOeeGroup(@Body() b: any)                      { return this.svc.createOeeGroup(b); }
  @Put('oee/groups/:id')                     updateOeeGroup(@Param('id', ParseIntPipe) id: number, @Body() b: any) { return this.svc.updateOeeGroup(id, b); }
  @Delete('oee/groups/:id')                  deleteOeeGroup(@Param('id', ParseIntPipe) id: number) { return this.svc.deleteOeeGroup(id); }

  @Get('oee/machines')                       oeeMachines()                                        { return this.svc.oeeMachines(); }
  @Post('oee/machines')                      createOeeMachine(@Body() b: any)                    { return this.svc.createOeeMachine(b); }
  @Put('oee/machines/:id')                   updateOeeMachine(@Param('id', ParseIntPipe) id: number, @Body() b: any) { return this.svc.updateOeeMachine(id, b); }
  @Delete('oee/machines/:id')                deleteOeeMachine(@Param('id', ParseIntPipe) id: number) { return this.svc.deleteOeeMachine(id); }

  @Get('oee/holidays')                       oeeHolidays()                                        { return this.svc.oeeHolidays(); }
  @Post('oee/holidays')                      createOeeHoliday(@Body() b: any)                    { return this.svc.createOeeHoliday(b); }
  @Delete('oee/holidays/:id')                deleteOeeHoliday(@Param('id', ParseIntPipe) id: number) { return this.svc.deleteOeeHoliday(id); }

  @Get('oee/loss-categories')                oeeLossCats()                                        { return this.svc.oeeLossCategories(); }
  @Post('oee/loss-categories')               createOeeLossCat(@Body() b: any)                    { return this.svc.createOeeLossCategory(b); }
  @Delete('oee/loss-categories/:id')         deleteOeeLossCat(@Param('id', ParseIntPipe) id: number) { return this.svc.deleteOeeLossCategory(id); }

  @Get('oee/bottlenecks')                    oeeBottlenecks()                                     { return this.svc.oeeBottlenecks(); }
  @Post('oee/bottlenecks')                   createOeeBottleneck(@Body() b: any)                 { return this.svc.createOeeBottleneck(b); }
  @Delete('oee/bottlenecks/:id')             deleteOeeBottleneck(@Param('id', ParseIntPipe) id: number) { return this.svc.deleteOeeBottleneck(id); }

  @Get('oee/departments')                    oeeDepartments()                                     { return this.svc.oeeDepartments(); }
  @Post('oee/departments')                   createOeeDepartment(@Body() b: any)                 { return this.svc.createOeeDepartment(b); }
  @Put('oee/departments/:id')                updateOeeDepartment(@Param('id', ParseIntPipe) id: number, @Body() b: any) { return this.svc.updateOeeDepartment(id, b); }
  @Delete('oee/departments/:id')             deleteOeeDepartment(@Param('id', ParseIntPipe) id: number) { return this.svc.deleteOeeDepartment(id); }

  // Audit Tracker masters — under /audit-tracker/* to avoid colliding with
  // the existing AuditController (/audit/:id) which would otherwise catch
  // /audit/teams as `id=teams` and 400 on ParseIntPipe.
  @Get('audit-tracker/teams')                auditTeams()                                         { return this.svc.auditTeams(); }
  @Post('audit-tracker/teams')               createAuditTeam(@Body() b: any)                     { return this.svc.createAuditTeam(b); }
  @Put('audit-tracker/teams/:id')            updateAuditTeam(@Param('id', ParseIntPipe) id: number, @Body() b: any) { return this.svc.updateAuditTeam(id, b); }
  @Delete('audit-tracker/teams/:id')         deleteAuditTeam(@Param('id', ParseIntPipe) id: number) { return this.svc.deleteAuditTeam(id); }

  @Get('audit-tracker/cutoff-dates')         auditCutoffs()                                       { return this.svc.auditCutoffDates(); }
  @Post('audit-tracker/cutoff-dates')        createAuditCutoff(@Body() b: any)                   { return this.svc.createAuditCutoff(b); }
  @Delete('audit-tracker/cutoff-dates/:id')  deleteAuditCutoff(@Param('id', ParseIntPipe) id: number) { return this.svc.deleteAuditCutoff(id); }
}
