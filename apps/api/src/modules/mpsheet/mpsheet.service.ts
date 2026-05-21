import { Injectable, NotFoundException } from '@nestjs/common';
import { Op } from '@hero/db';
import {
  MpRequest,
  MpTimeline,
  MpApprover,
  MpClassification,
} from '@hero/db/src/models/generated';

export interface MpRequestDto {
  plantId: number;
  type: string; // 'equipment' | 'non-equipment'
  raisedBy?: string;
  equipmentNo?: string;
  equipmentName: string;
  section?: string;
  functionLocation: string;
  subLocation?: string;
  classificationId: string; // comma-separated or JSON list of classification IDs
  correctorId?: number;
  machinePartName: string;
  noOfIncidents?: number;
  costLoss?: number;
  totalHoursLost?: number;
  problemDescription: string;
  counterMeasure: string;
  proposedImprovement: string;
  effectiveness: string;
  nonEquipmentId?: string;
  nonEquipmentNo?: number;
  departmentId?: number;
  sectionId?: number;
  nonFunctionLocation?: string;
  problemCategory: string;
  imageBefore?: string;
  imageAfter?: string;
  document?: string;
  other?: string;
  createdBy: number;
}

/**
 * MPSheet (Maintenance Prevention Sheet) — Wave 2 module.
 *
 * Employees raise MP requests for equipment / non-equipment incidents.
 * Approvers are configured per plant + type. Timeline records each action.
 *
 * Tables:
 *   mp_request        — the main request
 *   mp_timeline       — action history per request
 *   mp_approver       — configured approver users per plant + type
 *   mp_classification — classification / category lookup
 */
@Injectable()
export class MpsheetService {
  // ── Master data ──────────────────────────────────────────────────────────────

  async getClassifications() {
    return MpClassification.findAll({
      where: { isDeleted: '0', status: '1' } as any,
      order: [['name', 'ASC']],
    });
  }

  async getApprovers(plantId?: number, type?: string) {
    const where: any = {};
    if (plantId) where.plantId = plantId;
    if (type) where.type = type;
    return MpApprover.findAll({ where });
  }

  // ── Requests ─────────────────────────────────────────────────────────────────

  async listRequests(opts: {
    createdBy?: number;
    plantId?: number;
    type?: string;
    status?: string;
    from?: string;
    to?: string;
    all?: boolean;
  } = {}) {
    const where: any = { isDeleted: '0' };
    if (opts.plantId) where.plantId = opts.plantId;
    if (opts.type) where.type = opts.type;
    if (opts.status) where.status = opts.status;
    if (opts.from && opts.to) {
      where.createdAt = { [Op.between]: [opts.from, opts.to] };
    } else if (opts.from) {
      where.createdAt = { [Op.gte]: opts.from };
    }
    if (!opts.all && opts.createdBy) where.createdBy = opts.createdBy;
    return MpRequest.findAll({
      where,
      order: [['createdAt', 'DESC']],
    });
  }

  async getRequest(id: number) {
    const req = await MpRequest.findByPk(id);
    if (!req) throw new NotFoundException('MP request not found');
    const timeline = await MpTimeline.findAll({
      where: { requestId: id } as any,
      order: [['createdAt', 'ASC']],
    });
    return { request: req, timeline };
  }

  async createRequest(dto: MpRequestDto) {
    return MpRequest.create({
      plantId: dto.plantId,
      type: dto.type,
      raisedBy: dto.raisedBy ?? null,
      equipmentNo: dto.equipmentNo ?? null,
      equipmentName: dto.equipmentName,
      section: dto.section ?? null,
      functionLocation: dto.functionLocation,
      subLocation: dto.subLocation ?? null,
      classificationId: dto.classificationId,
      correctorId: dto.correctorId ?? null,
      machinePartName: dto.machinePartName,
      noOfIncidents: dto.noOfIncidents ?? null,
      costLoss: dto.costLoss ?? null,
      totalHoursLost: dto.totalHoursLost ?? null,
      problemDescription: dto.problemDescription,
      counterMeasure: dto.counterMeasure,
      proposedImprovement: dto.proposedImprovement,
      effectiveness: dto.effectiveness,
      nonEquipmentId: dto.nonEquipmentId ?? null,
      nonEquipmentNo: dto.nonEquipmentNo ?? null,
      departmentId: dto.departmentId ?? null,
      sectionId: dto.sectionId ?? null,
      nonFunctionLocation: dto.nonFunctionLocation ?? null,
      problemCategory: dto.problemCategory,
      createdBy: dto.createdBy,
      imageBefore: dto.imageBefore ?? null,
      imageAfter: dto.imageAfter ?? null,
      document: dto.document ?? null,
      other: dto.other ?? null,
      // mp_request.status enum starts at 'raised' (no 'pending'); legacy
      // workflow advances through Section Head → HOD → Maintenance HOD →
      // PE Head → PE HOD approvals.
      status: 'raised',
      isDeleted: '0',
      createdAt: new Date(),
      updatedAt: new Date(),
      statusUpdatedAt: new Date(),
    } as any);
  }

  async updateRequest(id: number, dto: Partial<MpRequestDto>) {
    const req = await MpRequest.findByPk(id);
    if (!req) throw new NotFoundException('MP request not found');
    await req.update({ ...dto, updatedAt: new Date() } as any);
    return req;
  }

  async deleteRequest(id: number) {
    const req = await MpRequest.findByPk(id);
    if (!req) throw new NotFoundException('MP request not found');
    await req.update({ isDeleted: '1', updatedAt: new Date() } as any);
    return { id, deleted: true };
  }

  // ── Timeline / Workflow ──────────────────────────────────────────────────────

  /**
   * Post a timeline action on an MP request.
   * actionType: 'submitted' | 'approved' | 'rejected' | 'revision' | 'closed' | 'reopened'
   * Side-effect: advances the request status.
   */
  async postAction(opts: {
    requestId: number;
    userId: number;
    actionType: string;
    remark?: string;
  }) {
    const req = await MpRequest.findByPk(opts.requestId);
    if (!req) throw new NotFoundException('MP request not found');

    // Map actionType → status
    const statusMap: Record<string, string> = {
      submitted: 'submitted',
      approved: 'approved',
      rejected: 'rejected',
      revision: 'revision',
      closed: 'closed',
      reopened: 'pending',
    };
    const newStatus = statusMap[opts.actionType] ?? (req as any).status;

    await MpTimeline.create({
      requestId: opts.requestId,
      userId: opts.userId,
      actionType: opts.actionType,
      remark: opts.remark ?? null,
      createdAt: new Date(),
      modifiedAt: new Date(),
    } as any);

    await req.update({
      status: newStatus,
      statusUpdatedAt: new Date(),
      updatedAt: new Date(),
    } as any);

    return req;
  }

  // ── Reminder tracking ────────────────────────────────────────────────────────

  /**
   * Returns open requests older than `daysOld` that haven't had a reminder yet.
   * Used by the escalation worker.
   */
  async pendingRequestsForReminder(daysOld: number) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - daysOld);
    return MpRequest.findAll({
      where: {
        status: 'pending',
        isDeleted: '0',
        createdAt: { [Op.lte]: cutoff },
        reminderSentAt: null,
      } as any,
    });
  }

  async recordReminderSent(id: number) {
    const req = await MpRequest.findByPk(id);
    if (!req) return;
    await req.update({ reminderSentAt: new Date() } as any);
  }

  // ── Stats ────────────────────────────────────────────────────────────────────

  async stats(opts: { createdBy?: number; plantId?: number } = {}) {
    const base: any = { isDeleted: '0' };
    if (opts.createdBy) base.createdBy = opts.createdBy;
    if (opts.plantId) base.plantId = opts.plantId;

    const [total, pending, approved, rejected, closed] = await Promise.all([
      MpRequest.count({ where: base }),
      MpRequest.count({ where: { ...base, status: 'pending' } }),
      MpRequest.count({ where: { ...base, status: 'approved' } }),
      MpRequest.count({ where: { ...base, status: 'rejected' } }),
      MpRequest.count({ where: { ...base, status: 'closed' } }),
    ]);

    return { total, pending, approved, rejected, closed };
  }
}
