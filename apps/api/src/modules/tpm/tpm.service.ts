import { Injectable, NotFoundException } from '@nestjs/common';
import { Op } from '@hero/db';
import {
  HazardRequest,
  HazardTimeline,
  HazardCategory,
  HazardSubCategory,
  HazardImpact,
  HazardAuditType,
  HazardTeamHierarchy,
  TpmApplications,
  TpmMasterPlant,
  TpmMasterData,
  TpmPlantApplications,
  TpmEscalation,
  OplRequest,
  OplRequestAction,
  OplPiller,
  OplTopic,
  OplTheme,
} from '@hero/db/src/models/generated';

export interface HazardDto {
  description: string;
  plantId: number;
  applicationId: number;
  departmentId?: number;
  sectionId?: number;
  impactId: number;
  categoryId: number;
  subCategoryId: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  photo?: string;
  endDate?: string;
  auditType: number;
  assignedTo?: number;
  createdBy: number;
}

export interface OplDto {
  language?: string;
  plantId: number;
  pillarId?: number;
  topicId?: number;
  sectionId?: number;
  departmentId?: number;
  applicationId: number;
  locationId?: number;
  themeId?: string;
  classificationType?: string;
  type?: string;
  firstPhoto?: string;
  secondPhoto?: string;
  remarksFirst?: string;
  remarksSecond?: string;
  description?: string;
  knowWhy?: string;
  familyWise?: string;
  circleWise?: string;
  createdBy: number;
}

/**
 * TPM (Total Productive Maintenance) — Wave 2 module.
 *
 * Sub-modules:
 *   Hazard: Safety hazard reports raised by operators, routed through
 *           plant/section heads for redressal. Escalation at 3d/7d/4w.
 *   OPL:    One Point Lessons — knowledge-sharing cards submitted by
 *           floor operators, approved by pillar leads & plant head.
 *
 * Tables:
 *   hazard_request, hazard_timeline, hazard_category, hazard_sub_category,
 *   hazard_impact, hazard_audit_type, hazard_team_hierarchy
 *   opl_request, opl_request_action, opl_piller, opl_topic, opl_theme
 *   tpm_applications, tpm_master_plant, tpm_master_data,
 *   tpm_plant_applications, tpm_escalation
 */
@Injectable()
export class TpmService {
  // ── Master data ─────────────────────────────────────────────────────────────

  async getApplications() {
    return TpmApplications.findAll({ order: [['id', 'ASC']] });
  }

  async getPlants() {
    return TpmMasterPlant.findAll({ order: [['plantName', 'ASC']] });
  }

  async getPlantDepts(plantCode?: string) {
    const where: any = {};
    if (plantCode) where.plantCode = plantCode;
    return TpmMasterData.findAll({ where, order: [['departmentName', 'ASC']] });
  }

  async getHazardCategories(hazardId?: number) {
    const where: any = { status: '1' };
    if (hazardId) where.hazardId = hazardId;
    return HazardCategory.findAll({ where, order: [['sort', 'ASC']] });
  }

  async getHazardSubCategories(categoryId?: number) {
    const where: any = {};
    if (categoryId) where.categoryId = categoryId;
    return HazardSubCategory.findAll({ where });
  }

  async getHazardImpacts() {
    return HazardImpact.findAll();
  }

  async getHazardAuditTypes() {
    return HazardAuditType.findAll();
  }

  async getOplPillars() {
    return OplPiller.findAll({ order: [['id', 'ASC']] });
  }

  async getOplTopics(pillarId?: number) {
    const where: any = {};
    if (pillarId) where.pillarId = pillarId;
    return OplTopic.findAll({ where });
  }

  async getOplThemes() {
    return OplTheme.findAll();
  }

  // ── Hazard Requests ──────────────────────────────────────────────────────────

  async listHazards(opts: {
    userId?: number;
    plantId?: number;
    applicationId?: number;
    status?: string;
    all?: boolean;
  } = {}) {
    const where: any = { isDeleted: '0' };
    if (opts.plantId) where.plantId = opts.plantId;
    if (opts.applicationId) where.applicationId = opts.applicationId;
    if (opts.status) where.status = opts.status;
    if (!opts.all && opts.userId) {
      where[Op.or as any] = [
        { createdBy: opts.userId },
        { assignedTo: opts.userId },
        { currentlyAssign: opts.userId },
      ];
    }
    return HazardRequest.findAll({
      where,
      order: [['createdAt', 'DESC']],
    });
  }

  async getHazard(id: number) {
    const req = await HazardRequest.findByPk(id);
    if (!req) throw new NotFoundException('Hazard request not found');
    const timeline = await HazardTimeline.findAll({
      where: { requestId: id } as any,
      order: [['createdAt', 'ASC']],
    });
    return { request: req, timeline };
  }

  async createHazard(dto: HazardDto) {
    // Legacy `hazard_request` enum values:
    //   risk_level: ('low','medium','high')   ← lowercase only
    //   status:     ('pending','notify','completed','approval','improve')
    // The portal form lets users pick 'Low'/'Medium'/'High' so we normalize
    // both pieces here to keep MySQL happy.
    const risk = String(dto.riskLevel ?? 'low').toLowerCase() as 'low' | 'medium' | 'high';
    return HazardRequest.create({
      description: dto.description,
      plantId: dto.plantId,
      applicationId: dto.applicationId,
      departmentId: dto.departmentId ?? 0,
      sectionId: dto.sectionId ?? 0,
      impactId: dto.impactId,
      categoryId: dto.categoryId,
      subCategoryId: dto.subCategoryId,
      createdBy: dto.createdBy,
      assignedTo: dto.assignedTo ?? 0,
      currentlyAssign: dto.assignedTo ?? 0,
      riskLevel: risk,
      photo: dto.photo ?? null,
      endDate: dto.endDate ?? null,
      status: 'pending',
      isDeleted: '0',
      remarks: null,
      auditType: dto.auditType,
      adminRemark: null,
      createdAt: new Date(),
    } as any);
  }

  /**
   * Post a timeline entry (action from initiator or corrector).
   * Timeline drives the approval flow: open → in_progress → closed.
   */
  async postTimeline(opts: {
    requestId: number;
    postedBy: number;
    postTo: number;
    description?: string;
    targetDate?: string;
    photo?: string;
    initiatorAction?: string;
    correctorAction?: string;
    parentId?: number;
  }) {
    const req = await HazardRequest.findByPk(opts.requestId);
    if (!req) throw new NotFoundException('Hazard request not found');

    const entry = await HazardTimeline.create({
      parentId: opts.parentId ?? null,
      requestId: opts.requestId,
      postedBy: opts.postedBy,
      postTo: opts.postTo,
      initiatorAction: opts.initiatorAction ?? null,
      correctorAction: opts.correctorAction ?? null,
      description: opts.description ?? null,
      targetDate: opts.targetDate ?? null,
      photo: opts.photo ?? null,
      createdAt: new Date(),
    } as any);

    // Auto-advance status
    if (opts.initiatorAction === 'accepted' || opts.correctorAction === 'corrected') {
      await req.update({ status: 'in_progress' } as any);
    } else if (opts.correctorAction === 'closed') {
      await req.update({ status: 'closed' } as any);
    }

    return entry;
  }

  async updateHazardStatus(id: number, status: string, adminRemark?: string) {
    const req = await HazardRequest.findByPk(id);
    if (!req) throw new NotFoundException('Hazard request not found');
    await req.update({ status, adminRemark: adminRemark ?? null } as any);
    return req;
  }

  async deleteHazard(id: number) {
    const req = await HazardRequest.findByPk(id);
    if (!req) throw new NotFoundException('Hazard request not found');
    await req.update({ isDeleted: '1' } as any);
    return { id, deleted: true };
  }

  // ── OPL Requests ──────────────────────────────────────────────────────────

  async listOpl(opts: {
    userId?: number;
    plantId?: number;
    applicationId?: number;
    status?: string;
    all?: boolean;
    isDraft?: boolean;
  } = {}) {
    const where: any = { isDeleted: '0' };
    if (opts.plantId) where.plantId = opts.plantId;
    if (opts.applicationId) where.applicationId = opts.applicationId;
    if (opts.status) where.status = opts.status;
    if (opts.isDraft !== undefined) where.isDraft = opts.isDraft ? '1' : '0';
    if (!opts.all && opts.userId) {
      where.createdBy = opts.userId;
    }
    return OplRequest.findAll({
      where,
      order: [['createdAt', 'DESC']],
    });
  }

  async getOpl(id: number) {
    const opl = await OplRequest.findByPk(id);
    if (!opl) throw new NotFoundException('OPL not found');
    const actions = await OplRequestAction.findAll({
      where: { oplId: id } as any,
      order: [['createdAt', 'ASC']],
    });
    return { opl, actions };
  }

  async createOpl(dto: OplDto) {
    // opl_request.language is enum('hindi','english') — coerce common short
    // codes ('en'/'hi') to the full enum word the column expects.
    const lang =
      dto.language === 'hindi' || dto.language === 'hi' ? 'hindi'
      : dto.language === 'english' || dto.language === 'en' ? 'english'
      : 'english';
    return OplRequest.create({
      oplNo: null,
      language: lang,
      plantId: dto.plantId,
      pillarId: dto.pillarId ?? null,
      topicId: dto.topicId ?? null,
      sectionId: dto.sectionId ?? null,
      departmentId: dto.departmentId ?? null,
      applicationId: dto.applicationId,
      locationId: dto.locationId ?? null,
      step: null,
      themeId: dto.themeId ?? null,
      classificationType: dto.classificationType ?? null,
      status: 'draft',
      remarkStatus: null,
      type: dto.type ?? null,
      onePhotoType: null,
      firstPhoto: dto.firstPhoto ?? null,
      secondPhoto: dto.secondPhoto ?? null,
      remarksFirst: dto.remarksFirst ?? null,
      remarksSecond: dto.remarksSecond ?? null,
      description: dto.description ?? null,
      knowWhy: dto.knowWhy ?? null,
      receiveLesson: '0',
      createdBy: dto.createdBy,
      isDeleted: '0',
      createdAt: new Date(),
      modifiedAt: new Date(),
      isDraft: '1',
      familyWise: dto.familyWise ?? null,
      circleWise: dto.circleWise ?? null,
    } as any);
  }

  async updateOpl(id: number, dto: Partial<OplDto> & { status?: string; isDraft?: string; oplNo?: string }) {
    const opl = await OplRequest.findByPk(id);
    if (!opl) throw new NotFoundException('OPL not found');
    await opl.update({ ...dto, modifiedAt: new Date() } as any);
    return opl;
  }

  async submitOpl(id: number) {
    const opl = await OplRequest.findByPk(id);
    if (!opl) throw new NotFoundException('OPL not found');
    await opl.update({ isDraft: '0', status: 'pending', modifiedAt: new Date() } as any);
    return opl;
  }

  /**
   * Approval action on an OPL (approve / reject / request_revision).
   */
  async actionOpl(opts: {
    oplId: number;
    actionBy: number;
    action: 'approved' | 'rejected' | 'revision';
    remarks?: string;
    step?: string;
  }) {
    const opl = await OplRequest.findByPk(opts.oplId);
    if (!opl) throw new NotFoundException('OPL not found');

    const actionEntry = await OplRequestAction.create({
      oplId: opts.oplId,
      actionBy: opts.actionBy,
      action: opts.action,
      remarks: opts.remarks ?? null,
      step: opts.step ?? null,
      createdAt: new Date(),
    } as any);

    let newStatus = (opl as any).status;
    if (opts.action === 'approved') {
      // Move to next step or mark complete
      const step = parseInt(opts.step ?? '1', 10);
      newStatus = step >= 3 ? 'approved' : 'pending'; // simplified: 3 approval levels
      await opl.update({ status: newStatus, step: String(step + 1) } as any);
    } else if (opts.action === 'rejected') {
      newStatus = 'rejected';
      await opl.update({ status: 'rejected', remarkStatus: opts.remarks } as any);
    } else if (opts.action === 'revision') {
      newStatus = 'revision';
      await opl.update({ status: 'revision', remarkStatus: opts.remarks, isDraft: '1' } as any);
    }

    return { opl: await OplRequest.findByPk(opts.oplId), action: actionEntry };
  }

  async deleteOpl(id: number) {
    const opl = await OplRequest.findByPk(id);
    if (!opl) throw new NotFoundException('OPL not found');
    await opl.update({ isDeleted: '1' } as any);
    return { id, deleted: true };
  }

  // ── Escalation queries (called by BullMQ worker) ───────────────────────────

  /**
   * Returns open hazard requests that are past their end_date.
   * Escalation: 3 days → line manager, 1 week → section head, 4 weeks → dept head.
   */
  async hazardsForEscalation(daysOverdue: 3 | 7 | 28) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDate = new Date(today);
    targetDate.setDate(targetDate.getDate() - daysOverdue);
    const dateStr = targetDate.toISOString().slice(0, 10);

    return HazardRequest.findAll({
      where: {
        isDeleted: '0',
        status: { [Op.notIn]: ['closed', 'rejected'] },
        endDate: dateStr,
      } as any,
      raw: true,
    });
  }

  /** Plant-level escalation config. */
  async getEscalationConfig(plantId: number, applicationId: number) {
    return TpmEscalation.findOne({
      where: { plantId, applicationId } as any,
    });
  }
}
