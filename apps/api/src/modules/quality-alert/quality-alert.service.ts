import { Injectable, NotFoundException } from '@nestjs/common';
import {
  QaRequest,
  QaRequestAttachments,
  QaTimeline,
  QaInitiator,
  QaSubdepartment,
  QaTaskUser,
} from '@hero/db/src/models/generated';

/**
 * Quality Alert — Wave 2 module.
 *
 * Tracks quality alerts raised at production plants.
 * An initiator raises a request citing alert reason, line, shift, frame number.
 * A quality person is assigned; the request goes through review stages.
 *
 * Tables:
 *   qa_request              — main quality alert record
 *   qa_request_attachments  — file attachments per request
 *   qa_timeline             — status/action timeline
 *   qa_initiator            — initiator users
 *   qa_subdepartment        — sub-department master
 *   qa_task_user            — task assignment
 */
@Injectable()
export class QualityAlertService {
  // ── Requests ─────────────────────────────────────────────────────────────────

  async listRequests(opts: {
    departmentId?: number;
    plantId?: number;
    status?: string;
    createdBy?: number;
    all?: boolean;
    page?: number;
    pageSize?: number;
  } = {}) {
    const page = Math.max(1, opts.page ?? 1);
    const pageSize = Math.min(opts.pageSize ?? 20, 100);
    const where: any = { isDeleted: '0' };
    if (!opts.all && opts.status) where.status = opts.status;
    if (opts.departmentId) where.departmentId = opts.departmentId;
    if (opts.plantId) where.plantId = opts.plantId;
    if (!opts.all && opts.createdBy) where.createdBy = opts.createdBy;

    const { rows, count } = await QaRequest.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: pageSize,
      offset: (page - 1) * pageSize,
    });
    return { items: rows, total: count, page, pageSize };
  }

  async getRequest(id: number) {
    const req = await QaRequest.findOne({ where: { id, isDeleted: '0' } as any });
    if (!req) throw new NotFoundException('Quality alert not found');
    const [attachments, timeline, taskUsers] = await Promise.all([
      QaRequestAttachments.findAll({ where: { requestId: id } as any }),
      QaTimeline.findAll({ where: { requestId: id } as any, order: [['id', 'DESC']] }),
      QaTaskUser.findAll({ where: { requestId: id } as any }),
    ]);
    return { request: req, attachments, timeline, taskUsers };
  }

  async createRequest(dto: {
    title: string;
    departmentId: number;
    sectionId?: number;
    subDepartmentId?: number;
    alertReason?: string;
    line?: string;
    alertDate?: string;
    shift?: string;
    frameNumber?: string;
    qualityPerson?: number;
    plantId?: number;
    createdBy: number;
    status?: string;
  }) {
    // qa_request: most string/int columns are NOT NULL — default text to '' and ids to 0
    return QaRequest.create({
      title: dto.title,
      departmentId: dto.departmentId,
      sectionId: dto.sectionId ?? 0,
      subDepartmentId: dto.subDepartmentId ?? 0,
      alertReason: dto.alertReason ?? '',
      line: dto.line ?? '',
      alertDate: dto.alertDate ?? new Date().toISOString().slice(0, 10),
      shift: dto.shift ?? '',
      frameNumber: dto.frameNumber ?? '',
      qualityPerson: dto.qualityPerson ?? 0,
      plantId: dto.plantId ?? 0,
      createdBy: dto.createdBy,
      // qa_request.status enum: 'Pending' | 'Approved' | 'Rejected' | 'Closed' | 'Pending For Approval'
      status: dto.status ?? 'Pending',
      isDeleted: '0',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);
  }

  async updateRequest(id: number, dto: any) {
    const req = await QaRequest.findByPk(id);
    if (!req) throw new NotFoundException();
    await req.update({ ...dto, updatedAt: new Date() } as any);
    return req;
  }

  async deleteRequest(id: number) {
    const req = await QaRequest.findByPk(id);
    if (!req) throw new NotFoundException();
    await req.update({ isDeleted: '1', updatedAt: new Date() } as any);
    return { id, deleted: true };
  }

  // ── Timeline ──────────────────────────────────────────────────────────────────

  async addTimeline(dto: { requestId: number; actionType?: string; remark?: string; userId?: number }) {
    return QaTimeline.create({
      requestId: dto.requestId,
      actionType: dto.actionType ?? 'comment',
      remark: dto.remark ?? '',
      userId: dto.userId ?? 0,
      createdAt: new Date(),
      modifiedAt: new Date(),
    } as any);
  }

  // ── Attachments ───────────────────────────────────────────────────────────────

  async addAttachment(dto: { requestId: number; file: string; timelineId?: number }) {
    return QaRequestAttachments.create({
      requestId: dto.requestId,
      file: dto.file,
      timelineId: dto.timelineId ?? 0,
    } as any);
  }

  // ── Masters ───────────────────────────────────────────────────────────────────

  async subdepartments() {
    return QaSubdepartment.findAll({ order: [['id', 'ASC']] });
  }
}
