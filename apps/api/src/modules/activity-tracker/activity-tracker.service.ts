import { Injectable, NotFoundException } from '@nestjs/common';
import { Op } from '@hero/db';
import {
  ActivityTrackerPrograms,
  ActivityTrackerTasks,
  ActivityTrackerTaskUser,
  ActivityTrackerEmailEscalation,
  ActivityTrackerReviseRequest,
  ActivityTrackerTransferRequest,
} from '@hero/db/src/models/generated';

export interface ProgramDto {
  title: string;
  alias?: string;
  departmentId?: number;
  sortOrder?: number;
  status?: string;
}

export interface TaskDto {
  title: string;
  alias?: string;
  code?: string;
  shortDescription?: string;
  description?: string;
  programId: number;
  assignedTo?: number;
  currentOwner?: number;
  ccEmails?: string;
  bccEmails?: string;
  mailFrequency?: 'daily' | 'weekly' | 'monthly';
  startDate: string;
  endDate: string;
  uploadedFile?: string;
  status?: string;
  remarks?: string;
  createdBy: number;
}

/**
 * Activity Tracker — Wave 2 module.
 *
 * Tables:
 *   activity_tracker_programs   — programs/categories for grouping tasks
 *   activity_tracker_tasks      — individual tasks with deadlines & ownership
 *   activity_tracker_task_user  — tracks user ownership history per task
 *   activity_tracker_email_escalation — escalation mail state per task
 *   activity_tracker_revise_request   — end-date revision requests
 *   activity_tracker_transfer_request — ownership transfer requests
 *
 * Escalation schedule (driven by task end_date):
 *   - 30 days before: notify owner (cc reporting manager + creator)
 *   - on end_date if incomplete: escalate to reporting manager
 *   - +7 days: second escalation
 *   - +15 days: third escalation (mail_count)
 *
 * Mail frequency per task controls how often the escalation cron fires
 * (daily/weekly/monthly — stored in task.mail_frequency).
 */
@Injectable()
export class ActivityTrackerService {
  // ── Programs ──────────────────────────────────────────────────────────────

  async listPrograms(opts: { departmentId?: number } = {}) {
    const where: any = { isDeleted: '0', status: '1' };
    if (opts.departmentId) where.departmentId = opts.departmentId;
    return ActivityTrackerPrograms.findAll({
      where,
      order: [['sortOrder', 'ASC'], ['title', 'ASC']],
    });
  }

  async listProgramsAdmin() {
    return ActivityTrackerPrograms.findAll({
      where: { isDeleted: '0' } as any,
      order: [['sortOrder', 'ASC'], ['title', 'ASC']],
    });
  }

  async getProgram(id: number) {
    const row = await ActivityTrackerPrograms.findByPk(id);
    if (!row) throw new NotFoundException('Program not found');
    return row;
  }

  async createProgram(dto: ProgramDto) {
    return ActivityTrackerPrograms.create({
      title: dto.title,
      alias: dto.alias ?? slugify(dto.title),
      departmentId: dto.departmentId ?? null,
      sortOrder: dto.sortOrder ?? 0,
      status: dto.status ?? '1',
      isDeleted: '0',
      createdAt: new Date(),
    } as any);
  }

  async updateProgram(id: number, dto: Partial<ProgramDto>) {
    const row = await ActivityTrackerPrograms.findByPk(id);
    if (!row) throw new NotFoundException('Program not found');
    await row.update(dto as any);
    return row;
  }

  async removeProgram(id: number) {
    const row = await ActivityTrackerPrograms.findByPk(id);
    if (!row) throw new NotFoundException('Program not found');
    await row.update({ isDeleted: '1' } as any);
    return { id, deleted: true };
  }

  // ── Tasks ─────────────────────────────────────────────────────────────────

  /**
   * List tasks for a given user (tasks they own or are assigned to).
   * Also supports admin list-all via omitting userId.
   */
  async listTasks(opts: {
    userId?: number;
    programId?: number;
    status?: string;
    all?: boolean;
  } = {}) {
    const where: any = { isDeleted: '0' };
    if (opts.programId) where.programId = opts.programId;
    if (opts.status) where.status = opts.status;
    if (!opts.all && opts.userId) {
      where[Op.or as any] = [
        { assignedTo: opts.userId },
        { currentOwner: opts.userId },
        { createdBy: opts.userId },
      ];
    }
    const tasks = await ActivityTrackerTasks.findAll({
      where,
      order: [['endDate', 'ASC'], ['createdAt', 'DESC']],
      raw: true,
    });
    // Enrich with program info if needed
    const programIds = [...new Set(tasks.map((t: any) => t.programId).filter(Boolean))];
    let programMap: Map<number, any> = new Map();
    if (programIds.length) {
      const programs = await ActivityTrackerPrograms.findAll({
        where: { id: { [Op.in]: programIds } } as any,
        raw: true,
      });
      programs.forEach((p: any) => programMap.set(p.id, p));
    }
    return tasks.map((t: any) => ({
      ...t,
      program: programMap.get(t.programId) ?? null,
    }));
  }

  async getTask(id: number) {
    const task = await ActivityTrackerTasks.findByPk(id);
    if (!task) throw new NotFoundException('Task not found');
    // Fetch ownership history
    const users = await ActivityTrackerTaskUser.findAll({
      where: { taskId: id } as any,
      order: [['id', 'DESC']],
    });
    const revisions = await ActivityTrackerReviseRequest.findAll({
      where: { taskId: id } as any,
      order: [['createdAt', 'DESC']],
    });
    const transfers = await ActivityTrackerTransferRequest.findAll({
      where: { taskId: id } as any,
      order: [['createdAt', 'DESC']],
    });
    return { task, users, revisions, transfers };
  }

  async createTask(dto: TaskDto) {
    const task = await ActivityTrackerTasks.create({
      title: dto.title,
      alias: dto.alias ?? slugify(dto.title),
      code: dto.code ?? null,
      shortDescription: dto.shortDescription ?? null,
      description: dto.description ?? null,
      programId: dto.programId,
      assignedTo: dto.assignedTo ?? null,
      currentOwner: dto.currentOwner ?? dto.assignedTo ?? null,
      ccEmails: dto.ccEmails ?? null,
      bccEmails: dto.bccEmails ?? null,
      hasOwnership: '1',
      isTransfered: '0',
      isRevised: '0',
      createdBy: dto.createdBy,
      mailFrequency: dto.mailFrequency ?? 'daily',
      startDate: dto.startDate,
      endDate: dto.endDate,
      completionDate: null,
      uploadedFile: dto.uploadedFile ?? null,
      status: dto.status ?? 'open',
      remarks: dto.remarks ?? null,
      isDeleted: '0',
      createdAt: new Date(),
    } as any);

    // Create task_user entry for initial owner
    if (dto.assignedTo) {
      await ActivityTrackerTaskUser.create({
        taskId: (task as any).id,
        userId: dto.assignedTo,
        currentMember: 1,
        withOwnership: '1',
        isTransfer: '0',
      } as any);
    }

    // Seed escalation record
    await ActivityTrackerEmailEscalation.create({
      taskId: (task as any).id,
      isTargetDatePassed: '0',
      ownerId: dto.assignedTo ?? 0,
      mailCount: 0,
      isSent: '0',
      isStopped: '0',
    } as any);

    return task;
  }

  async updateTask(id: number, dto: Partial<TaskDto>) {
    const task = await ActivityTrackerTasks.findByPk(id);
    if (!task) throw new NotFoundException('Task not found');
    await task.update(dto as any);
    // If task completed, set completion date
    if (dto.status === 'completed' && !(task as any).completionDate) {
      await task.update({ completionDate: new Date().toISOString().slice(0, 10) } as any);
      // Stop escalation
      await ActivityTrackerEmailEscalation.update(
        { isStopped: '1' } as any,
        { where: { taskId: id } as any },
      );
    }
    return task;
  }

  async removeTask(id: number) {
    const task = await ActivityTrackerTasks.findByPk(id);
    if (!task) throw new NotFoundException('Task not found');
    await task.update({ isDeleted: '1' } as any);
    return { id, deleted: true };
  }

  // ── Revise Requests ───────────────────────────────────────────────────────

  async requestRevise(opts: {
    taskId: number;
    sendBy: number;
    sendTo: number;
    description?: string;
    newDate: string;
  }) {
    const task = await ActivityTrackerTasks.findByPk(opts.taskId);
    if (!task) throw new NotFoundException('Task not found');
    await task.update({ isRevised: '1' } as any);
    return ActivityTrackerReviseRequest.create({
      taskId: opts.taskId,
      sendBy: opts.sendBy,
      sendTo: opts.sendTo,
      description: opts.description ?? null,
      newDate: opts.newDate,
      actionTaken: 'pending',
      rejectReason: null,
      createdAt: new Date(),
    } as any);
  }

  async actionRevise(reviseId: number, opts: {
    actionTaken: 'approved' | 'rejected';
    rejectReason?: string;
  }) {
    const req: any = await ActivityTrackerReviseRequest.findByPk(reviseId);
    if (!req) throw new NotFoundException('Revise request not found');
    await req.update({
      actionTaken: opts.actionTaken,
      rejectReason: opts.rejectReason ?? null,
    } as any);
    if (opts.actionTaken === 'approved') {
      await ActivityTrackerTasks.update(
        { endDate: req.newDate, isRevised: '0' } as any,
        { where: { id: req.taskId } as any },
      );
      // Update escalation target date
      await ActivityTrackerEmailEscalation.update(
        { isSent: '0', isTargetDatePassed: '0', mailCount: 0 } as any,
        { where: { taskId: req.taskId } as any },
      );
    } else {
      await ActivityTrackerTasks.update(
        { isRevised: '0' } as any,
        { where: { id: req.taskId } as any },
      );
    }
    return req;
  }

  // ── Transfer Requests ─────────────────────────────────────────────────────

  async requestTransfer(opts: {
    taskId: number;
    sentBy: number;
    sentTo: number;
    ownershipType?: string;
  }) {
    const task = await ActivityTrackerTasks.findByPk(opts.taskId);
    if (!task) throw new NotFoundException('Task not found');
    await task.update({ isTransfered: '1' } as any);
    return ActivityTrackerTransferRequest.create({
      taskId: opts.taskId,
      sentBy: opts.sentBy,
      sentTo: opts.sentTo,
      ownershipType: opts.ownershipType ?? 'full',
      actionTaken: 'pending',
      rejectReason: null,
      createdAt: new Date(),
    } as any);
  }

  async actionTransfer(transferId: number, opts: {
    actionTaken: 'approved' | 'rejected';
    rejectReason?: string;
  }) {
    const req: any = await ActivityTrackerTransferRequest.findByPk(transferId);
    if (!req) throw new NotFoundException('Transfer request not found');
    await req.update({
      actionTaken: opts.actionTaken,
      rejectReason: opts.rejectReason ?? null,
    } as any);
    if (opts.actionTaken === 'approved') {
      // Transfer ownership
      const newOwner = req.sentTo;
      await ActivityTrackerTasks.update(
        { currentOwner: newOwner, isTransfered: '0' } as any,
        { where: { id: req.taskId } as any },
      );
      // Update task_user: clear current_member on old owner, add new
      await ActivityTrackerTaskUser.update(
        { currentMember: 0 } as any,
        { where: { taskId: req.taskId, currentMember: 1 } as any },
      );
      await ActivityTrackerTaskUser.create({
        taskId: req.taskId,
        userId: newOwner,
        currentMember: 1,
        withOwnership: '1',
        isTransfer: '1',
      } as any);
      // Update escalation owner
      await ActivityTrackerEmailEscalation.update(
        { ownerId: newOwner } as any,
        { where: { taskId: req.taskId } as any },
      );
    } else {
      await ActivityTrackerTasks.update(
        { isTransfered: '0' } as any,
        { where: { id: req.taskId } as any },
      );
    }
    return req;
  }

  // ── Escalation queries (called by BullMQ worker) ──────────────────────────

  /**
   * Returns tasks eligible for escalation mail based on their end_date.
   * The BullMQ worker calls this and sends emails accordingly.
   *
   * Triggers:
   *   before_30  — end_date is exactly 30 days from today (warning mail to owner)
   *   on_cutoff  — end_date is today and status != completed (first escalation to RO)
   *   after_7    — end_date was 7 days ago, status != completed
   *   after_15   — end_date was 15 days ago, status != completed
   */
  async tasksForEscalation(trigger: 'before_30' | 'on_cutoff' | 'after_7' | 'after_15') {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDate = new Date(today);
    const dayOffsets: Record<string, number> = {
      before_30: 30,
      on_cutoff: 0,
      after_7: -7,
      after_15: -15,
    };
    targetDate.setDate(targetDate.getDate() + (dayOffsets[trigger] ?? 0));
    const dateStr = targetDate.toISOString().slice(0, 10);

    const tasks = await ActivityTrackerTasks.findAll({
      where: {
        isDeleted: '0',
        endDate: dateStr,
        status: { [Op.notIn]: ['completed', 'closed'] },
      } as any,
      raw: true,
    });

    // Filter out tasks where escalation is stopped
    const taskIds = tasks.map((t: any) => t.id);
    if (!taskIds.length) return [];

    const stopped = await ActivityTrackerEmailEscalation.findAll({
      where: {
        taskId: { [Op.in]: taskIds },
        isStopped: '1',
      } as any,
      raw: true,
    });
    const stoppedIds = new Set(stopped.map((s: any) => s.taskId));
    return tasks.filter((t: any) => !stoppedIds.has(t.id));
  }

  /** Record that escalation mail was sent for a task. */
  async recordEscalationSent(taskId: number) {
    const today = new Date().toISOString().slice(0, 10);
    const existing: any = await ActivityTrackerEmailEscalation.findOne({
      where: { taskId } as any,
    });
    if (existing) {
      await existing.update({
        isSent: '1',
        mailSentAt: today,
        mailCount: (existing.mailCount ?? 0) + 1,
        isTargetDatePassed: existing.isTargetDatePassed === '0' ? '1' : existing.isTargetDatePassed,
      } as any);
    }
  }
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
