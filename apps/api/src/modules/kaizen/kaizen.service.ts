import { Injectable, NotFoundException } from '@nestjs/common';
import { Op } from '@hero/db';
import {
  KaizenRequest,
  KaizenTimeline,
  KaizenPillar,
  KaizenSection,
  KaizenLoss,
  KaizenMachine,
  KaizenMiscellaneous,
  KaizenPlant,
} from '@hero/db/src/models/generated';

export interface KaizenDto {
  kaizenNo?: string;
  pillarId?: number;
  departmentId?: number;
  sectionId?: number;
  category?: string;
  lossId?: number;
  savingType?: string;
  type?: string;
  typeId?: string;
  themeId?: number;
  idea?: string;
  mpKaizen?: string;
  ideaGivenBy?: string;
  ideaGivenId?: number;
  imageBefore?: string;
  imageAfter?: string;
  beforeImageRemark?: string;
  afterImageRemark?: string;
  problemDefinition?: string;
  counterMeasure?: string;
  resultBefore?: string;
  resultAfter?: string;
  analysis?: string;
  horizontalDeployment?: string;
  userLocationId?: number;
  startDate?: string;
  endDate?: string;
  annualBenefits?: number;
  investment?: number;
  draft?: string;
  createdBy: number;
}

/**
 * Kaizen — Wave 2 module.
 *
 * Kaizen (continuous improvement) submissions by plant employees.
 * Each kaizen has: before/after photos, problem definition, counter-measure,
 * savings calculation, and an approval workflow through section/pillar leads.
 *
 * Tables:
 *   kaizen_request, kaizen_timeline, kaizen_pillar, kaizen_section,
 *   kaizen_loss, kaizen_machine, kaizen_miscellaneous, kaizen_plant,
 *   kaizen_team_hierarchy, kaizen_idea_user, kaizen_initiator
 *
 * Approval flow:
 *   initiator submits (draft → submitted) → section head reviews
 *   → pillar head approves / returns for revision → plant head final approval.
 *
 * Status values:
 *   draft | submitted | under_review | approved | rejected | revision
 *   (stored in kaizen_request.current_status)
 */
@Injectable()
export class KaizenService {
  // ── Master data ──────────────────────────────────────────────────────────────

  async getPillars(isDeleted = false) {
    const where: any = isDeleted ? {} : { isDeleted: '0' };
    return KaizenPillar.findAll({ where, order: [['sortOrder', 'ASC']] });
  }

  async getSections(locationId?: number) {
    const where: any = { isDeleted: '0' };
    if (locationId) where.locationId = locationId;
    return KaizenSection.findAll({ where, order: [['sortOrder', 'ASC']] });
  }

  async getLosses() {
    return KaizenLoss.findAll({ order: [['id', 'ASC']] });
  }

  async getMachines() {
    return KaizenMachine.findAll({ order: [['id', 'ASC']] });
  }

  async getMisc() {
    return KaizenMiscellaneous.findAll();
  }

  async getPlants() {
    return KaizenPlant.findAll({ order: [['id', 'ASC']] });
  }

  // ── Kaizen Requests ──────────────────────────────────────────────────────────

  async listKaizens(opts: {
    userId?: number;
    pillarId?: number;
    status?: string;
    draft?: string;
    all?: boolean;
  } = {}) {
    const where: any = { isDeleted: '0' };
    if (opts.pillarId) where.pillarId = opts.pillarId;
    if (opts.status) where.currentStatus = opts.status;
    if (opts.draft !== undefined) where.draft = opts.draft;
    if (!opts.all && opts.userId) {
      where.createdBy = opts.userId;
    }
    return KaizenRequest.findAll({
      where,
      order: [['createdAt', 'DESC']],
    });
  }

  async getKaizen(id: number) {
    const kaizen = await KaizenRequest.findByPk(id);
    if (!kaizen) throw new NotFoundException('Kaizen not found');
    const timeline = await KaizenTimeline.findAll({
      where: { kaizenId: id } as any,
      order: [['createdOn', 'ASC']],
    });
    return { kaizen, timeline };
  }

  async createKaizen(dto: KaizenDto) {
    // kaizen_request enum constraints (verified against MySQL schema):
    //   category        ('A','B','C')                 NULL ok
    //   saving_type     ('One-Time','Recurring')      NOT NULL
    //   type            ('Machine','Non-Machine')     NOT NULL
    //   mp_kaizen       ('Yes','No')                  NULL ok — only set if valid
    //   idea_given_by   ('Staff','Operator')          NULL ok
    //   status          ('Pending','Completed')       NOT NULL, default 'Pending'
    //   post_status     ('Approve','Improve')         NOT NULL, default 'Approve'
    //   kaizen_no is UNIQUE — generate a timestamp-based default if caller didn't supply one
    const kaizenNo = dto.kaizenNo?.trim() || `KZ-${Date.now()}`;
    const savingType = (dto.savingType === 'Recurring' ? 'Recurring' : 'One-Time') as 'One-Time' | 'Recurring';
    const type = (dto.type === 'Non-Machine' ? 'Non-Machine' : 'Machine') as 'Machine' | 'Non-Machine';
    const mpKaizen = dto.mpKaizen === 'Yes' || dto.mpKaizen === 'No' ? dto.mpKaizen : null;
    const kaizen = await KaizenRequest.create({
      kaizenNo,
      pillarId: dto.pillarId ?? null,
      departmentId: dto.departmentId ?? null,
      sectionId: dto.sectionId ?? null,
      category: dto.category ?? null,
      lossId: dto.lossId ?? null,
      benefitId: null,
      savingType,
      measurementUnit: null,
      type,
      typeId: dto.typeId ?? null,
      themeId: dto.themeId ?? null,
      idea: dto.idea ?? null,
      mpKaizen,
      ideaGivenBy: dto.ideaGivenBy ?? null,
      ideaGivenId: dto.ideaGivenId ?? null,
      imageBefore: dto.imageBefore ?? null,
      imageAfter: dto.imageAfter ?? null,
      beforeImageRemark: dto.beforeImageRemark ?? null,
      afterImageRemark: dto.afterImageRemark ?? null,
      problemDefinition: dto.problemDefinition ?? null,
      counterMeasure: dto.counterMeasure ?? null,
      resultBefore: dto.resultBefore ?? null,
      resultAfter: dto.resultAfter ?? null,
      analysis: dto.analysis ?? null,
      horizontalDeployment: dto.horizontalDeployment ?? null,
      userLocationId: dto.userLocationId ?? 0,
      status: 'Pending',
      currentStatus: dto.draft === '1' ? 'draft' : 'submitted',
      postStatus: 'Approve',
      draft: dto.draft ?? '1',
      startDate: dto.startDate ?? null,
      endDate: dto.endDate ?? null,
      annualBenefits: dto.annualBenefits ?? 0,
      investment: dto.investment ?? 0,
      isDeleted: '0',
      createdBy: dto.createdBy,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);

    // Log initial timeline entry
    if (dto.draft !== '1') {
      await KaizenTimeline.create({
        kaizenId: (kaizen as any).id,
        parentId: 0,
        userId: dto.createdBy,
        message: 'Kaizen submitted for review.',
        roleType: 'initiator',
        currentStatus: 'submitted',
        status: 'submitted',
        createdOn: new Date(),
      } as any);
    }

    return kaizen;
  }

  async updateKaizen(id: number, dto: Partial<KaizenDto>) {
    const kaizen = await KaizenRequest.findByPk(id);
    if (!kaizen) throw new NotFoundException('Kaizen not found');
    await kaizen.update({ ...dto, updatedAt: new Date() } as any);
    return kaizen;
  }

  async submitKaizen(id: number, userId: number) {
    const kaizen = await KaizenRequest.findByPk(id);
    if (!kaizen) throw new NotFoundException('Kaizen not found');
    await kaizen.update({
      draft: '0',
      currentStatus: 'submitted',
      postStatus: 'pending',
      updatedAt: new Date(),
    } as any);
    await KaizenTimeline.create({
      kaizenId: id,
      parentId: 0,
      userId,
      message: 'Kaizen submitted for review.',
      roleType: 'initiator',
      currentStatus: 'submitted',
      status: 'submitted',
      createdOn: new Date(),
    } as any);
    return kaizen;
  }

  /**
   * Approval action by section head / pillar head / plant head.
   * roleType: 'section_head' | 'pillar_head' | 'plant_head'
   * action: 'approved' | 'rejected' | 'revision'
   */
  async actionKaizen(opts: {
    kaizenId: number;
    userId: number;
    roleType: string;
    action: string;
    message?: string;
  }) {
    const kaizen = await KaizenRequest.findByPk(opts.kaizenId);
    if (!kaizen) throw new NotFoundException('Kaizen not found');

    let nextStatus = (kaizen as any).currentStatus;
    if (opts.action === 'approved') {
      const flow: Record<string, string> = {
        section_head: 'pillar_review',
        pillar_head: 'plant_review',
        plant_head: 'approved',
      };
      nextStatus = flow[opts.roleType] ?? 'approved';
    } else if (opts.action === 'rejected') {
      nextStatus = 'rejected';
    } else if (opts.action === 'revision') {
      nextStatus = 'revision';
    }

    await kaizen.update({ currentStatus: nextStatus, updatedAt: new Date() } as any);

    await KaizenTimeline.create({
      kaizenId: opts.kaizenId,
      parentId: 0,
      userId: opts.userId,
      message: opts.message ?? `${opts.action} by ${opts.roleType}`,
      roleType: opts.roleType,
      currentStatus: nextStatus,
      status: opts.action,
      createdOn: new Date(),
    } as any);

    return { kaizen: await KaizenRequest.findByPk(opts.kaizenId) };
  }

  async deleteKaizen(id: number) {
    const kaizen = await KaizenRequest.findByPk(id);
    if (!kaizen) throw new NotFoundException('Kaizen not found');
    await kaizen.update({ isDeleted: '1' } as any);
    return { id, deleted: true };
  }

  // ── Summary stats ────────────────────────────────────────────────────────────

  async stats(userId?: number) {
    const where: any = { isDeleted: '0' };
    if (userId) where.createdBy = userId;
    const all = await KaizenRequest.findAll({ where, raw: true });
    return {
      total: all.length,
      draft: all.filter((k: any) => k.draft === '1').length,
      submitted: all.filter((k: any) => k.currentStatus === 'submitted').length,
      approved: all.filter((k: any) => k.currentStatus === 'approved').length,
      rejected: all.filter((k: any) => k.currentStatus === 'rejected').length,
    };
  }
}
