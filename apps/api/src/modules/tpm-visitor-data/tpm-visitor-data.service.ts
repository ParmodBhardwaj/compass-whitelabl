import { Injectable, NotFoundException } from '@nestjs/common';
import { Op } from '@hero/db';
import {
  HazardCategory,
  HazardSubCategory,
  HazardAuditType,
  InjuryReason,
  InjuredBodyPart,
  InjuredSubBodyPart,
  KaizenPillar,
  KaizenLoss,
  KaizenMachine,
  KaizenSection,
  KaizenPlant,
  KsEquipmentType,
  KsUom,
  TpmMasterPlant,
  TpmEscalation,
  TpmMasterNonStaff,
  InjuryOfficerUser,
  MpClassification,
  OplTheme,
  OplOpexTeam,
  OeeBusinessExcellence,
  OeeMfgCoordinator,
  HeroKpointVideos,
  VisitorLocations,
  VisitorInstructions,
  VisitorApprovalMembers,
  VisitorDisabledFields,
  VisitorSecurityMembers,
  VisitorCanteenMember,
  VisitorReceptionMember,
  VisitorFeedbackLocationDept,
  VisitorFeedbackQuestions,
  VisitorPass,
  VisitorLocationWiseGrades,
} from '@hero/db/src/models/generated';

/**
 * TPM + Visitor master-data admin service.
 * Each entity gets the standard 4 ops (list / create / update / delete).
 * Soft delete is honoured for tables that have `is_deleted`.
 */
@Injectable()
export class TpmVisitorDataService {
  // ── helper for tables with is_deleted soft delete ──
  private async softDelete<T extends { update: any }>(model: any, id: number, hasSoftDelete: boolean) {
    const r = await model.findByPk(id);
    if (!r) throw new NotFoundException();
    if (hasSoftDelete) await r.update({ isDeleted: '1' });
    else await r.destroy();
    return { id, deleted: true };
  }

  // ── TPM: Hazard masters ─────────────────────────────────────────────
  hazardCategories()        { return HazardCategory.findAll({ order: [['sort', 'ASC']] }); }
  createHazardCategory(b: any) { return HazardCategory.create(b); }
  async updateHazardCategory(id: number, b: any) {
    const r = await HazardCategory.findByPk(id); if (!r) throw new NotFoundException();
    await r.update(b); return r;
  }
  deleteHazardCategory(id: number) { return this.softDelete(HazardCategory, id, false); }

  hazardSubCategories()     { return HazardSubCategory.findAll({ order: [['sort', 'ASC']] }); }
  createHazardSubCategory(b: any) { return HazardSubCategory.create(b); }
  async updateHazardSubCategory(id: number, b: any) {
    const r = await HazardSubCategory.findByPk(id); if (!r) throw new NotFoundException();
    await r.update(b); return r;
  }
  deleteHazardSubCategory(id: number) { return this.softDelete(HazardSubCategory, id, false); }

  hazardTypes()             { return HazardAuditType.findAll({ order: [['id', 'ASC']] }); }
  createHazardType(b: any)  { return HazardAuditType.create(b); }
  async updateHazardType(id: number, b: any) {
    const r = await HazardAuditType.findByPk(id); if (!r) throw new NotFoundException();
    await r.update(b); return r;
  }
  deleteHazardType(id: number) { return this.softDelete(HazardAuditType, id, false); }

  // ── TPM: Injury masters ─────────────────────────────────────────────
  injuryReasons()           { return InjuryReason.findAll({ where: { isDeleted: '0' } as any, order: [['name', 'ASC']] }); }
  createInjuryReason(b: any){ return InjuryReason.create({ ...b, status: b.status ?? '1', isDeleted: '0' }); }
  async updateInjuryReason(id: number, b: any) {
    const r = await InjuryReason.findByPk(id); if (!r) throw new NotFoundException();
    await r.update(b); return r;
  }
  deleteInjuryReason(id: number) { return this.softDelete(InjuryReason, id, true); }

  injuredBodyParts()        { return InjuredBodyPart.findAll({ order: [['id', 'ASC']] }); }
  createInjuredBodyPart(b: any) { return InjuredBodyPart.create(b); }
  async updateInjuredBodyPart(id: number, b: any) {
    const r = await InjuredBodyPart.findByPk(id); if (!r) throw new NotFoundException();
    await r.update(b); return r;
  }
  deleteInjuredBodyPart(id: number) { return this.softDelete(InjuredBodyPart, id, false); }

  injuredSubBodyParts()     { return InjuredSubBodyPart.findAll({ order: [['id', 'ASC']] }); }
  createInjuredSubBodyPart(b: any) { return InjuredSubBodyPart.create(b); }
  async updateInjuredSubBodyPart(id: number, b: any) {
    const r = await InjuredSubBodyPart.findByPk(id); if (!r) throw new NotFoundException();
    await r.update(b); return r;
  }
  deleteInjuredSubBodyPart(id: number) { return this.softDelete(InjuredSubBodyPart, id, false); }

  // ── TPM: Kaizen masters ─────────────────────────────────────────────
  kaizenPillars()           { return KaizenPillar.findAll({ where: { isDeleted: '0' } as any, order: [['sortOrder', 'ASC']] }); }
  createKaizenPillar(b: any){ return KaizenPillar.create({ ...b, status: b.status ?? '1', isDeleted: '0' }); }
  async updateKaizenPillar(id: number, b: any) {
    const r = await KaizenPillar.findByPk(id); if (!r) throw new NotFoundException();
    await r.update(b); return r;
  }
  deleteKaizenPillar(id: number) { return this.softDelete(KaizenPillar, id, true); }

  kaizenLosses()            { return KaizenLoss.findAll({ where: { isDeleted: '0' } as any, order: [['sortOrder', 'ASC']] }); }
  createKaizenLoss(b: any)  { return KaizenLoss.create({ ...b, status: b.status ?? '1', isDeleted: '0' }); }
  async updateKaizenLoss(id: number, b: any) {
    const r = await KaizenLoss.findByPk(id); if (!r) throw new NotFoundException();
    await r.update(b); return r;
  }
  deleteKaizenLoss(id: number) { return this.softDelete(KaizenLoss, id, true); }

  kaizenMachines()          { return KaizenMachine.findAll({ order: [['id', 'DESC']] }); }
  createKaizenMachine(b: any){ return KaizenMachine.create(b); }
  async updateKaizenMachine(id: number, b: any) {
    const r = await KaizenMachine.findByPk(id); if (!r) throw new NotFoundException();
    await r.update(b); return r;
  }
  deleteKaizenMachine(id: number) { return this.softDelete(KaizenMachine, id, false); }

  kaizenSections()          { return KaizenSection.findAll({ order: [['id', 'ASC']] }); }
  createKaizenSection(b: any){ return KaizenSection.create(b); }
  async updateKaizenSection(id: number, b: any) {
    const r = await KaizenSection.findByPk(id); if (!r) throw new NotFoundException();
    await r.update(b); return r;
  }
  deleteKaizenSection(id: number) { return this.softDelete(KaizenSection, id, false); }

  kaizenPlants()            { return KaizenPlant.findAll({ order: [['id', 'ASC']] }); }
  createKaizenPlant(b: any) { return KaizenPlant.create(b); }
  async updateKaizenPlant(id: number, b: any) {
    const r = await KaizenPlant.findByPk(id); if (!r) throw new NotFoundException();
    await r.update(b); return r;
  }
  deleteKaizenPlant(id: number) { return this.softDelete(KaizenPlant, id, false); }

  // ── TPM: KS (Tag/Equipment) masters ─────────────────────────────────
  ksEquipmentTypes()        { return KsEquipmentType.findAll({ order: [['id', 'ASC']] }); }
  createKsEquipmentType(b: any) { return KsEquipmentType.create(b); }
  async updateKsEquipmentType(id: number, b: any) {
    const r = await KsEquipmentType.findByPk(id); if (!r) throw new NotFoundException();
    await r.update(b); return r;
  }
  deleteKsEquipmentType(id: number) { return this.softDelete(KsEquipmentType, id, false); }

  ksUoms()                  { return KsUom.findAll({ order: [['name', 'ASC']] }); }
  createKsUom(b: any)       { return KsUom.create(b); }
  async updateKsUom(id: number, b: any) {
    const r = await KsUom.findByPk(id); if (!r) throw new NotFoundException();
    await r.update(b); return r;
  }
  deleteKsUom(id: number)   { return this.softDelete(KsUom, id, false); }

  // ── TPM masters ─────────────────────────────────────────────────────
  tpmPlants()               { return TpmMasterPlant.findAll({ order: [['plantName', 'ASC']] }); }
  createTpmPlant(b: any)    { return TpmMasterPlant.create(b); }
  async updateTpmPlant(id: number, b: any) {
    const r = await TpmMasterPlant.findByPk(id); if (!r) throw new NotFoundException();
    await r.update(b); return r;
  }
  deleteTpmPlant(id: number){ return this.softDelete(TpmMasterPlant, id, false); }

  tpmEscalations()          { return TpmEscalation.findAll({ order: [['id', 'ASC']] }); }
  createTpmEscalation(b: any){ return TpmEscalation.create(b); }
  async updateTpmEscalation(id: number, b: any) {
    const r = await TpmEscalation.findByPk(id); if (!r) throw new NotFoundException();
    await r.update(b); return r;
  }
  deleteTpmEscalation(id: number) { return this.softDelete(TpmEscalation, id, false); }

  // ── Visitor masters ─────────────────────────────────────────────────
  visitorLocations()        { return VisitorLocations.findAll({ order: [['name', 'ASC']] }); }
  createVisitorLocation(b: any){ return VisitorLocations.create(b); }
  async updateVisitorLocation(id: number, b: any) {
    const r = await VisitorLocations.findByPk(id); if (!r) throw new NotFoundException();
    await r.update(b); return r;
  }
  deleteVisitorLocation(id: number) { return this.softDelete(VisitorLocations, id, false); }

  visitorInstructions()     { return VisitorInstructions.findAll({ order: [['id', 'ASC']] }); }
  createVisitorInstruction(b: any){ return VisitorInstructions.create(b); }
  async updateVisitorInstruction(id: number, b: any) {
    const r = await VisitorInstructions.findByPk(id); if (!r) throw new NotFoundException();
    await r.update(b); return r;
  }
  deleteVisitorInstruction(id: number) { return this.softDelete(VisitorInstructions, id, false); }

  visitorApprovalMembers()  { return VisitorApprovalMembers.findAll({ order: [['id', 'ASC']] }); }
  createVisitorApprovalMember(b: any){ return VisitorApprovalMembers.create(b); }
  deleteVisitorApprovalMember(id: number) { return this.softDelete(VisitorApprovalMembers, id, false); }

  visitorDisabledFields()   { return VisitorDisabledFields.findAll({ order: [['id', 'ASC']] }); }
  createVisitorDisabledField(b: any){ return VisitorDisabledFields.create(b); }
  deleteVisitorDisabledField(id: number) { return this.softDelete(VisitorDisabledFields, id, false); }

  visitorSecurityMembers()  { return VisitorSecurityMembers.findAll({ order: [['id', 'ASC']] }); }
  createVisitorSecurityMember(b: any){ return VisitorSecurityMembers.create(b); }
  deleteVisitorSecurityMember(id: number) { return this.softDelete(VisitorSecurityMembers, id, false); }

  visitorCanteenMembers()   { return VisitorCanteenMember.findAll({ order: [['id', 'ASC']] }); }
  createVisitorCanteenMember(b: any){ return VisitorCanteenMember.create(b); }
  deleteVisitorCanteenMember(id: number) { return this.softDelete(VisitorCanteenMember, id, false); }

  visitorReceptionMembers() { return VisitorReceptionMember.findAll({ order: [['id', 'ASC']] }); }
  createVisitorReceptionMember(b: any){ return VisitorReceptionMember.create(b); }
  deleteVisitorReceptionMember(id: number) { return this.softDelete(VisitorReceptionMember, id, false); }

  visitorFeedbackLocations(){ return VisitorFeedbackLocationDept.findAll({ order: [['id', 'ASC']] }); }
  createVisitorFeedbackLocation(b: any){ return VisitorFeedbackLocationDept.create(b); }
  deleteVisitorFeedbackLocation(id: number) { return this.softDelete(VisitorFeedbackLocationDept, id, false); }

  visitorFeedbackQuestions(){ return VisitorFeedbackQuestions.findAll({ order: [['id', 'ASC']] }); }
  createVisitorFeedbackQuestion(b: any){ return VisitorFeedbackQuestions.create(b); }
  async updateVisitorFeedbackQuestion(id: number, b: any) {
    const r = await VisitorFeedbackQuestions.findByPk(id); if (!r) throw new NotFoundException();
    await r.update(b); return r;
  }
  deleteVisitorFeedbackQuestion(id: number) { return this.softDelete(VisitorFeedbackQuestions, id, false); }

  visitorPasses()           { return VisitorPass.findAll({ order: [['name', 'ASC']] }); }
  createVisitorPass(b: any) { return VisitorPass.create(b); }
  async updateVisitorPass(id: number, b: any) {
    const r = await VisitorPass.findByPk(id); if (!r) throw new NotFoundException();
    await r.update(b); return r;
  }
  deleteVisitorPass(id: number) { return this.softDelete(VisitorPass, id, false); }

  visitorGrades()           { return VisitorLocationWiseGrades.findAll({ order: [['id', 'ASC']] }); }
  createVisitorGrade(b: any){ return VisitorLocationWiseGrades.create(b); }
  deleteVisitorGrade(id: number) { return this.softDelete(VisitorLocationWiseGrades, id, false); }

  // ── TPM: Officers (one table with type enum) ────────────────────────
  injuryOfficers(type?: 'medical' | 'safety' | 'hr' | 'hazard-safety') {
    const where: any = {};
    if (type) where.type = type;
    return InjuryOfficerUser.findAll({ where, order: [['id', 'ASC']] });
  }
  createInjuryOfficer(b: any) { return InjuryOfficerUser.create(b); }
  async updateInjuryOfficer(id: number, b: any) {
    const r = await InjuryOfficerUser.findByPk(id); if (!r) throw new NotFoundException();
    await r.update(b); return r;
  }
  deleteInjuryOfficer(id: number) { return this.softDelete(InjuryOfficerUser, id, false); }

  // ── TPM: Classifications (mp_classification) ────────────────────────
  classifications() { return MpClassification.findAll({ where: { isDeleted: '0' } as any, order: [['name', 'ASC']] }); }
  createClassification(b: any) { return MpClassification.create({ ...b, status: b.status ?? '1', isDeleted: '0' }); }
  async updateClassification(id: number, b: any) {
    const r = await MpClassification.findByPk(id); if (!r) throw new NotFoundException();
    await r.update(b); return r;
  }
  deleteClassification(id: number) { return this.softDelete(MpClassification, id, true); }

  // ── TPM: KaiZen Themes / Opex Team (opl_*) ──────────────────────────
  themes() { return OplTheme.findAll({ where: { isDeleted: '0' } as any, order: [['name', 'ASC']] }); }
  createTheme(b: any) { return OplTheme.create({ ...b, status: b.status ?? '1', isDeleted: '0' }); }
  async updateTheme(id: number, b: any) {
    const r = await OplTheme.findByPk(id); if (!r) throw new NotFoundException();
    await r.update(b); return r;
  }
  deleteTheme(id: number) { return this.softDelete(OplTheme, id, true); }

  opexTeams() { return OplOpexTeam.findAll({ order: [['id', 'ASC']] }); }
  createOpexTeam(b: any) { return OplOpexTeam.create(b); }
  deleteOpexTeam(id: number) { return this.softDelete(OplOpexTeam, id, false); }

  // ── TPM: Non-Staff master ───────────────────────────────────────────
  nonStaff(opts: { q?: string } = {}) {
    const where: any = {};
    if (opts.q) {
      where[Op.or] = [
        { employeeName: { [Op.like]: `%${opts.q}%` } },
        { ecNo: { [Op.like]: `%${opts.q}%` } },
        { departmentName: { [Op.like]: `%${opts.q}%` } },
      ];
    }
    return TpmMasterNonStaff.findAll({ where, order: [['employeeName', 'ASC']], limit: 500 });
  }
  createNonStaff(b: any) { return TpmMasterNonStaff.create(b); }
  async updateNonStaff(id: number, b: any) {
    const r = await TpmMasterNonStaff.findByPk(id); if (!r) throw new NotFoundException();
    await r.update(b); return r;
  }
  deleteNonStaff(id: number) { return this.softDelete(TpmMasterNonStaff, id, false); }

  // ── OEE: extras ─────────────────────────────────────────────────────
  oeeBusinessExcellences() { return OeeBusinessExcellence.findAll({ order: [['id', 'DESC']] }); }
  createOeeBusinessExcellence(b: any) { return OeeBusinessExcellence.create(b); }
  deleteOeeBusinessExcellence(id: number) { return this.softDelete(OeeBusinessExcellence, id, false); }

  oeeMfgCoordinators() { return OeeMfgCoordinator.findAll({ order: [['id', 'ASC']] }); }
  createOeeMfgCoordinator(b: any) { return OeeMfgCoordinator.create(b); }
  deleteOeeMfgCoordinator(id: number) { return this.softDelete(OeeMfgCoordinator, id, false); }

  // ── KPoint: Videos catalogue (used by the unified /admin/kpoint/videos) ─
  kpointVideos(opts: { type?: string; language?: string; videoLinkId?: number; q?: string } = {}) {
    const where: any = {};
    if (opts.type) where.type = opts.type;
    if (opts.language) where.language = opts.language;
    if (opts.videoLinkId) where.videoLinkId = opts.videoLinkId;
    if (opts.q) where.videoLink = { [Op.like]: `%${opts.q}%` };
    return HeroKpointVideos.findAll({ where, order: [['id', 'DESC']], limit: 500 });
  }
  createKpointVideo(b: any) { return HeroKpointVideos.create(b); }
  async updateKpointVideo(id: number, b: any) {
    const r = await HeroKpointVideos.findByPk(id); if (!r) throw new NotFoundException();
    await r.update(b); return r;
  }
  deleteKpointVideo(id: number) { return this.softDelete(HeroKpointVideos, id, false); }
}
