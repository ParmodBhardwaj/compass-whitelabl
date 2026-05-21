import {
  Body, Controller, Delete, Get, Param, ParseIntPipe,
  Post, Put, Query, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TpmVisitorDataService } from './tpm-visitor-data.service';

/**
 * TPM + Visitor master-data admin CRUD. Each resource maps to a small
 * admin page driven by MasterDataPanel under /admin/tpm/* or /admin/visitors/*.
 *
 * Routes deliberately use /tpm-master/* and /visitor-master/* to avoid
 * colliding with the existing TpmModule (/tpm/hazards) and VisitorsModule
 * (/visitors/passes) controllers used by the portal-side flows.
 */
@Controller()
@UseGuards(AuthGuard('jwt'))
export class TpmVisitorDataController {
  constructor(private readonly svc: TpmVisitorDataService) {}

  // TPM — Hazard masters
  @Get('tpm-master/hazard-categories')             hcs()                                                           { return this.svc.hazardCategories(); }
  @Post('tpm-master/hazard-categories')            createHC(@Body() b: any)                                       { return this.svc.createHazardCategory(b); }
  @Put('tpm-master/hazard-categories/:id')         updateHC(@Param('id', ParseIntPipe) id: number, @Body() b: any){ return this.svc.updateHazardCategory(id, b); }
  @Delete('tpm-master/hazard-categories/:id')      deleteHC(@Param('id', ParseIntPipe) id: number)                { return this.svc.deleteHazardCategory(id); }

  @Get('tpm-master/hazard-sub-categories')         hsc()                                                          { return this.svc.hazardSubCategories(); }
  @Post('tpm-master/hazard-sub-categories')        createHSC(@Body() b: any)                                      { return this.svc.createHazardSubCategory(b); }
  @Put('tpm-master/hazard-sub-categories/:id')     updateHSC(@Param('id', ParseIntPipe) id: number, @Body() b: any){ return this.svc.updateHazardSubCategory(id, b); }
  @Delete('tpm-master/hazard-sub-categories/:id')  deleteHSC(@Param('id', ParseIntPipe) id: number)               { return this.svc.deleteHazardSubCategory(id); }

  @Get('tpm-master/hazard-types')                  hts()                                                          { return this.svc.hazardTypes(); }
  @Post('tpm-master/hazard-types')                 createHT(@Body() b: any)                                       { return this.svc.createHazardType(b); }
  @Put('tpm-master/hazard-types/:id')              updateHT(@Param('id', ParseIntPipe) id: number, @Body() b: any){ return this.svc.updateHazardType(id, b); }
  @Delete('tpm-master/hazard-types/:id')           deleteHT(@Param('id', ParseIntPipe) id: number)                { return this.svc.deleteHazardType(id); }

  // TPM — Injury masters
  @Get('tpm-master/injury-reasons')                irs()                                                          { return this.svc.injuryReasons(); }
  @Post('tpm-master/injury-reasons')               createIR(@Body() b: any)                                       { return this.svc.createInjuryReason(b); }
  @Put('tpm-master/injury-reasons/:id')            updateIR(@Param('id', ParseIntPipe) id: number, @Body() b: any){ return this.svc.updateInjuryReason(id, b); }
  @Delete('tpm-master/injury-reasons/:id')         deleteIR(@Param('id', ParseIntPipe) id: number)                { return this.svc.deleteInjuryReason(id); }

  @Get('tpm-master/injured-body-parts')            ibp()                                                          { return this.svc.injuredBodyParts(); }
  @Post('tpm-master/injured-body-parts')           createIBP(@Body() b: any)                                      { return this.svc.createInjuredBodyPart(b); }
  @Put('tpm-master/injured-body-parts/:id')        updateIBP(@Param('id', ParseIntPipe) id: number, @Body() b: any){ return this.svc.updateInjuredBodyPart(id, b); }
  @Delete('tpm-master/injured-body-parts/:id')     deleteIBP(@Param('id', ParseIntPipe) id: number)               { return this.svc.deleteInjuredBodyPart(id); }

  @Get('tpm-master/injured-sub-body-parts')        isbp()                                                         { return this.svc.injuredSubBodyParts(); }
  @Post('tpm-master/injured-sub-body-parts')       createISBP(@Body() b: any)                                     { return this.svc.createInjuredSubBodyPart(b); }
  @Put('tpm-master/injured-sub-body-parts/:id')    updateISBP(@Param('id', ParseIntPipe) id: number, @Body() b: any){ return this.svc.updateInjuredSubBodyPart(id, b); }
  @Delete('tpm-master/injured-sub-body-parts/:id') deleteISBP(@Param('id', ParseIntPipe) id: number)              { return this.svc.deleteInjuredSubBodyPart(id); }

  // TPM — Kaizen masters
  @Get('tpm-master/kaizen-pillars')                kp()                                                           { return this.svc.kaizenPillars(); }
  @Post('tpm-master/kaizen-pillars')               createKP(@Body() b: any)                                       { return this.svc.createKaizenPillar(b); }
  @Put('tpm-master/kaizen-pillars/:id')            updateKP(@Param('id', ParseIntPipe) id: number, @Body() b: any){ return this.svc.updateKaizenPillar(id, b); }
  @Delete('tpm-master/kaizen-pillars/:id')         deleteKP(@Param('id', ParseIntPipe) id: number)                { return this.svc.deleteKaizenPillar(id); }

  @Get('tpm-master/kaizen-losses')                 kl()                                                           { return this.svc.kaizenLosses(); }
  @Post('tpm-master/kaizen-losses')                createKL(@Body() b: any)                                       { return this.svc.createKaizenLoss(b); }
  @Put('tpm-master/kaizen-losses/:id')             updateKL(@Param('id', ParseIntPipe) id: number, @Body() b: any){ return this.svc.updateKaizenLoss(id, b); }
  @Delete('tpm-master/kaizen-losses/:id')          deleteKL(@Param('id', ParseIntPipe) id: number)                { return this.svc.deleteKaizenLoss(id); }

  @Get('tpm-master/kaizen-machines')               km()                                                           { return this.svc.kaizenMachines(); }
  @Post('tpm-master/kaizen-machines')              createKM(@Body() b: any)                                       { return this.svc.createKaizenMachine(b); }
  @Put('tpm-master/kaizen-machines/:id')           updateKM(@Param('id', ParseIntPipe) id: number, @Body() b: any){ return this.svc.updateKaizenMachine(id, b); }
  @Delete('tpm-master/kaizen-machines/:id')        deleteKM(@Param('id', ParseIntPipe) id: number)                { return this.svc.deleteKaizenMachine(id); }

  @Get('tpm-master/kaizen-sections')               ksec()                                                         { return this.svc.kaizenSections(); }
  @Post('tpm-master/kaizen-sections')              createKSec(@Body() b: any)                                     { return this.svc.createKaizenSection(b); }
  @Put('tpm-master/kaizen-sections/:id')           updateKSec(@Param('id', ParseIntPipe) id: number, @Body() b: any){ return this.svc.updateKaizenSection(id, b); }
  @Delete('tpm-master/kaizen-sections/:id')        deleteKSec(@Param('id', ParseIntPipe) id: number)              { return this.svc.deleteKaizenSection(id); }

  @Get('tpm-master/kaizen-plants')                 kpl()                                                          { return this.svc.kaizenPlants(); }
  @Post('tpm-master/kaizen-plants')                createKPl(@Body() b: any)                                      { return this.svc.createKaizenPlant(b); }
  @Put('tpm-master/kaizen-plants/:id')             updateKPl(@Param('id', ParseIntPipe) id: number, @Body() b: any){ return this.svc.updateKaizenPlant(id, b); }
  @Delete('tpm-master/kaizen-plants/:id')          deleteKPl(@Param('id', ParseIntPipe) id: number)               { return this.svc.deleteKaizenPlant(id); }

  // TPM — KS masters (Tag / Equipment)
  @Get('tpm-master/ks-equipment-types')            ket()                                                          { return this.svc.ksEquipmentTypes(); }
  @Post('tpm-master/ks-equipment-types')           createKET(@Body() b: any)                                      { return this.svc.createKsEquipmentType(b); }
  @Put('tpm-master/ks-equipment-types/:id')        updateKET(@Param('id', ParseIntPipe) id: number, @Body() b: any){ return this.svc.updateKsEquipmentType(id, b); }
  @Delete('tpm-master/ks-equipment-types/:id')     deleteKET(@Param('id', ParseIntPipe) id: number)               { return this.svc.deleteKsEquipmentType(id); }

  @Get('tpm-master/ks-uoms')                       ku()                                                           { return this.svc.ksUoms(); }
  @Post('tpm-master/ks-uoms')                      createKU(@Body() b: any)                                       { return this.svc.createKsUom(b); }
  @Put('tpm-master/ks-uoms/:id')                   updateKU(@Param('id', ParseIntPipe) id: number, @Body() b: any){ return this.svc.updateKsUom(id, b); }
  @Delete('tpm-master/ks-uoms/:id')                deleteKU(@Param('id', ParseIntPipe) id: number)                { return this.svc.deleteKsUom(id); }

  // TPM plants + escalations
  @Get('tpm-master/plants')                        tp()                                                           { return this.svc.tpmPlants(); }
  @Post('tpm-master/plants')                       createTP(@Body() b: any)                                       { return this.svc.createTpmPlant(b); }
  @Put('tpm-master/plants/:id')                    updateTP(@Param('id', ParseIntPipe) id: number, @Body() b: any){ return this.svc.updateTpmPlant(id, b); }
  @Delete('tpm-master/plants/:id')                 deleteTP(@Param('id', ParseIntPipe) id: number)                { return this.svc.deleteTpmPlant(id); }

  @Get('tpm-master/escalations')                   te()                                                           { return this.svc.tpmEscalations(); }
  @Post('tpm-master/escalations')                  createTE(@Body() b: any)                                       { return this.svc.createTpmEscalation(b); }
  @Put('tpm-master/escalations/:id')               updateTE(@Param('id', ParseIntPipe) id: number, @Body() b: any){ return this.svc.updateTpmEscalation(id, b); }
  @Delete('tpm-master/escalations/:id')            deleteTE(@Param('id', ParseIntPipe) id: number)                { return this.svc.deleteTpmEscalation(id); }

  // Visitor masters
  @Get('visitor-master/locations')                 vl()                                                           { return this.svc.visitorLocations(); }
  @Post('visitor-master/locations')                createVL(@Body() b: any)                                       { return this.svc.createVisitorLocation(b); }
  @Put('visitor-master/locations/:id')             updateVL(@Param('id', ParseIntPipe) id: number, @Body() b: any){ return this.svc.updateVisitorLocation(id, b); }
  @Delete('visitor-master/locations/:id')          deleteVL(@Param('id', ParseIntPipe) id: number)                { return this.svc.deleteVisitorLocation(id); }

  @Get('visitor-master/instructions')              vi()                                                           { return this.svc.visitorInstructions(); }
  @Post('visitor-master/instructions')             createVI(@Body() b: any)                                       { return this.svc.createVisitorInstruction(b); }
  @Put('visitor-master/instructions/:id')          updateVI(@Param('id', ParseIntPipe) id: number, @Body() b: any){ return this.svc.updateVisitorInstruction(id, b); }
  @Delete('visitor-master/instructions/:id')       deleteVI(@Param('id', ParseIntPipe) id: number)                { return this.svc.deleteVisitorInstruction(id); }

  @Get('visitor-master/approval-members')          vam()                                                          { return this.svc.visitorApprovalMembers(); }
  @Post('visitor-master/approval-members')         createVAM(@Body() b: any)                                      { return this.svc.createVisitorApprovalMember(b); }
  @Delete('visitor-master/approval-members/:id')   deleteVAM(@Param('id', ParseIntPipe) id: number)               { return this.svc.deleteVisitorApprovalMember(id); }

  @Get('visitor-master/disabled-fields')           vdf()                                                          { return this.svc.visitorDisabledFields(); }
  @Post('visitor-master/disabled-fields')          createVDF(@Body() b: any)                                      { return this.svc.createVisitorDisabledField(b); }
  @Delete('visitor-master/disabled-fields/:id')    deleteVDF(@Param('id', ParseIntPipe) id: number)               { return this.svc.deleteVisitorDisabledField(id); }

  @Get('visitor-master/security-members')          vsm()                                                          { return this.svc.visitorSecurityMembers(); }
  @Post('visitor-master/security-members')         createVSM(@Body() b: any)                                      { return this.svc.createVisitorSecurityMember(b); }
  @Delete('visitor-master/security-members/:id')   deleteVSM(@Param('id', ParseIntPipe) id: number)               { return this.svc.deleteVisitorSecurityMember(id); }

  @Get('visitor-master/canteen-members')           vcm()                                                          { return this.svc.visitorCanteenMembers(); }
  @Post('visitor-master/canteen-members')          createVCM(@Body() b: any)                                      { return this.svc.createVisitorCanteenMember(b); }
  @Delete('visitor-master/canteen-members/:id')    deleteVCM(@Param('id', ParseIntPipe) id: number)               { return this.svc.deleteVisitorCanteenMember(id); }

  @Get('visitor-master/reception-members')         vrm()                                                          { return this.svc.visitorReceptionMembers(); }
  @Post('visitor-master/reception-members')        createVRM(@Body() b: any)                                      { return this.svc.createVisitorReceptionMember(b); }
  @Delete('visitor-master/reception-members/:id')  deleteVRM(@Param('id', ParseIntPipe) id: number)               { return this.svc.deleteVisitorReceptionMember(id); }

  @Get('visitor-master/feedback-locations')        vfl()                                                          { return this.svc.visitorFeedbackLocations(); }
  @Post('visitor-master/feedback-locations')       createVFL(@Body() b: any)                                      { return this.svc.createVisitorFeedbackLocation(b); }
  @Delete('visitor-master/feedback-locations/:id') deleteVFL(@Param('id', ParseIntPipe) id: number)               { return this.svc.deleteVisitorFeedbackLocation(id); }

  @Get('visitor-master/feedback-questions')        vfq()                                                          { return this.svc.visitorFeedbackQuestions(); }
  @Post('visitor-master/feedback-questions')       createVFQ(@Body() b: any)                                      { return this.svc.createVisitorFeedbackQuestion(b); }
  @Put('visitor-master/feedback-questions/:id')    updateVFQ(@Param('id', ParseIntPipe) id: number, @Body() b: any){ return this.svc.updateVisitorFeedbackQuestion(id, b); }
  @Delete('visitor-master/feedback-questions/:id') deleteVFQ(@Param('id', ParseIntPipe) id: number)               { return this.svc.deleteVisitorFeedbackQuestion(id); }

  @Get('visitor-master/passes')                    vp()                                                           { return this.svc.visitorPasses(); }
  @Post('visitor-master/passes')                   createVP(@Body() b: any)                                       { return this.svc.createVisitorPass(b); }
  @Put('visitor-master/passes/:id')                updateVP(@Param('id', ParseIntPipe) id: number, @Body() b: any){ return this.svc.updateVisitorPass(id, b); }
  @Delete('visitor-master/passes/:id')             deleteVP(@Param('id', ParseIntPipe) id: number)                { return this.svc.deleteVisitorPass(id); }

  @Get('visitor-master/grades')                    vg()                                                           { return this.svc.visitorGrades(); }
  @Post('visitor-master/grades')                   createVG(@Body() b: any)                                       { return this.svc.createVisitorGrade(b); }
  @Delete('visitor-master/grades/:id')             deleteVG(@Param('id', ParseIntPipe) id: number)                { return this.svc.deleteVisitorGrade(id); }

  // TPM Officers (one /tpm-master/officers endpoint, filter by ?type=)
  @Get('tpm-master/officers')
  injuryOfficers(@Query('type') type?: 'medical' | 'safety' | 'hr' | 'hazard-safety') {
    return this.svc.injuryOfficers(type);
  }
  @Post('tpm-master/officers')              createIO(@Body() b: any)                                        { return this.svc.createInjuryOfficer(b); }
  @Put('tpm-master/officers/:id')           updateIO(@Param('id', ParseIntPipe) id: number, @Body() b: any) { return this.svc.updateInjuryOfficer(id, b); }
  @Delete('tpm-master/officers/:id')        deleteIO(@Param('id', ParseIntPipe) id: number)                 { return this.svc.deleteInjuryOfficer(id); }

  // TPM Classifications
  @Get('tpm-master/classifications')        cls()                                                          { return this.svc.classifications(); }
  @Post('tpm-master/classifications')       createCls(@Body() b: any)                                      { return this.svc.createClassification(b); }
  @Put('tpm-master/classifications/:id')    updateCls(@Param('id', ParseIntPipe) id: number, @Body() b: any){ return this.svc.updateClassification(id, b); }
  @Delete('tpm-master/classifications/:id') deleteCls(@Param('id', ParseIntPipe) id: number)               { return this.svc.deleteClassification(id); }

  // TPM Themes + Opex Team
  @Get('tpm-master/themes')                 themes()                                                       { return this.svc.themes(); }
  @Post('tpm-master/themes')                createTh(@Body() b: any)                                       { return this.svc.createTheme(b); }
  @Put('tpm-master/themes/:id')             updateTh(@Param('id', ParseIntPipe) id: number, @Body() b: any){ return this.svc.updateTheme(id, b); }
  @Delete('tpm-master/themes/:id')          deleteTh(@Param('id', ParseIntPipe) id: number)                { return this.svc.deleteTheme(id); }

  @Get('tpm-master/opex-team')              opex()                                                         { return this.svc.opexTeams(); }
  @Post('tpm-master/opex-team')             createOT(@Body() b: any)                                       { return this.svc.createOpexTeam(b); }
  @Delete('tpm-master/opex-team/:id')       deleteOT(@Param('id', ParseIntPipe) id: number)                { return this.svc.deleteOpexTeam(id); }

  // TPM Non-Staff master
  @Get('tpm-master/non-staff')
  nonStaff(@Query('q') q?: string)          { return this.svc.nonStaff({ q }); }
  @Post('tpm-master/non-staff')             createNS(@Body() b: any)                                       { return this.svc.createNonStaff(b); }
  @Put('tpm-master/non-staff/:id')          updateNS(@Param('id', ParseIntPipe) id: number, @Body() b: any){ return this.svc.updateNonStaff(id, b); }
  @Delete('tpm-master/non-staff/:id')       deleteNS(@Param('id', ParseIntPipe) id: number)                { return this.svc.deleteNonStaff(id); }

  // OEE extras
  @Get('oee-extras/business-excellence')        be()                                                       { return this.svc.oeeBusinessExcellences(); }
  @Post('oee-extras/business-excellence')       createBE(@Body() b: any)                                   { return this.svc.createOeeBusinessExcellence(b); }
  @Delete('oee-extras/business-excellence/:id') deleteBE(@Param('id', ParseIntPipe) id: number)            { return this.svc.deleteOeeBusinessExcellence(id); }

  @Get('oee-extras/mfg-coordinators')           mfg()                                                      { return this.svc.oeeMfgCoordinators(); }
  @Post('oee-extras/mfg-coordinators')          createMfg(@Body() b: any)                                  { return this.svc.createOeeMfgCoordinator(b); }
  @Delete('oee-extras/mfg-coordinators/:id')    deleteMfg(@Param('id', ParseIntPipe) id: number)           { return this.svc.deleteOeeMfgCoordinator(id); }

  // KPoint videos
  @Get('kpoint-admin/videos')
  kpointVideos(
    @Query('type') type?: string,
    @Query('language') language?: string,
    @Query('videoLinkId') videoLinkId?: string,
    @Query('q') q?: string,
  ) {
    return this.svc.kpointVideos({
      type, language, q,
      videoLinkId: videoLinkId ? +videoLinkId : undefined,
    });
  }
  @Post('kpoint-admin/videos')              createKV(@Body() b: any)                                       { return this.svc.createKpointVideo(b); }
  @Put('kpoint-admin/videos/:id')           updateKV(@Param('id', ParseIntPipe) id: number, @Body() b: any){ return this.svc.updateKpointVideo(id, b); }
  @Delete('kpoint-admin/videos/:id')        deleteKV(@Param('id', ParseIntPipe) id: number)                { return this.svc.deleteKpointVideo(id); }
}
