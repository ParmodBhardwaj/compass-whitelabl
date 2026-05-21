import { Injectable } from '@nestjs/common';
import { Op } from '@hero/db';
import {
  Audit,
  AuditSection,
  AuditRevise,
  AuditTimeline,
  AuditTimelineAttachment,
  AuditSectionLog,
  AuditCategory,
  AuditTheme,
  AuditInternalTeam,
} from '@hero/db/src/models/generated';

export type ObservationStatus = 'Implemented' | 'Partially Implemented' | 'Not Implemented';

@Injectable()
export class AuditService {
  /** Visible audits for a process owner / RO / function head / IA. */
  async listForUser(opts: { userId: number; status?: 'open' | 'closed' }) {
    const where: any = { isDeleted: '0' };
    if (opts.status) where.status = opts.status;
    return Audit.findAll({ where, order: [['createdOn', 'DESC']] });
  }

  async detail(auditId: number) {
    const audit = await Audit.findByPk(auditId);
    if (!audit) return null;
    const sections = await AuditSection.findAll({
      where: { auditId, isDeleted: '0' } as any,
      order: [['sortOrder', 'ASC']],
    });
    return { audit, sections };
  }

  /**
   * Flat audit-section export — every section with its parent audit name and
   * status. Used by the Excel report endpoint.
   */
  async sectionsForExport(opts: { auditId?: number; status?: string } = {}) {
    const sectionWhere: any = { isDeleted: '0' };
    if (opts.auditId) sectionWhere.auditId = opts.auditId;
    if (opts.status) sectionWhere.status = opts.status;
    const sections = await AuditSection.findAll({
      where: sectionWhere,
      order: [['auditId', 'ASC'], ['sortOrder', 'ASC']],
      raw: true,
    }) as any[];
    if (!sections.length) return [];

    const auditIds = [...new Set(sections.map((s) => s.auditId).filter(Boolean))];
    const audits = await Audit.findAll({
      where: { id: { [Op.in]: auditIds } } as any,
      raw: true,
    }) as any[];
    const auditById = new Map(audits.map((a) => [a.id, a]));

    return sections.map((s) => {
      const a = auditById.get(s.auditId);
      return {
        sectionId: s.id,
        auditId: s.auditId,
        auditName: a?.title ?? a?.auditName ?? `Audit #${s.auditId}`,
        sectionName: s.sectionName,
        observationDetail: (s.observationDetail ?? '').slice(0, 500),
        immediateActionPlan: (s.immediateActionPlan ?? '').slice(0, 500),
        systematicActionPlan: (s.systematicActionPlan ?? '').slice(0, 500),
        riskRating: s.riskRating,
        timeline: s.timeline,
        status: s.status ?? 'Open',
        processOwner: s.processOwner,
      };
    });
  }

  /**
   * Process owner uploads evidence for an observation (audit_section).
   * Adds a row to audit_timeline + attachments; sets section status to 'Partially Implemented'.
   */
  async submitEvidence(opts: {
    sectionId: number;
    userId: number;
    comment: string;
    attachments: { filename: string; path: string }[];
  }) {
    const section = await AuditSection.findByPk(opts.sectionId);
    if (!section) throw new Error('section not found');
    // audit_timeline schema requires:
    //   parent_id      NOT NULL  (root entry → 0)
    //   message        — long-text payload (we were sending it as `comment`!)
    //   role_type      NOT NULL  enum('process_owner','reporting_head','department_head','internal_audit')
    //   current_status NOT NULL  enum('1','2','3','4')  → 1 = "Submitted"
    //   status         NULL ok   enum('approved','declined') → leave null until reviewed
    const tl = await AuditTimeline.create({
      auditId: (section as any).auditId,
      sectionId: opts.sectionId,
      parentId: 0,
      userId: opts.userId,
      message: opts.comment,
      roleType: 'process_owner',
      currentStatus: '1',
      status: null,
      createdOn: new Date(),
    } as any);
    for (const a of opts.attachments) {
      await AuditTimelineAttachment.create({
        timelineId: (tl as any).id,
        filename: a.filename,
        path: a.path,
      } as any);
    }
    await AuditSection.update(
      { status: 'Partially Implemented' as ObservationStatus } as any,
      { where: { id: opts.sectionId } as any },
    );
    await this.log(opts.sectionId, opts.userId, 'evidence_submitted');
    return tl;
  }

  /** RO / FH / IA approves a timeline entry; status moves to next step. */
  async approve(opts: { timelineId: number; userId: number; role: 'ro' | 'fh' | 'ia' }) {
    const next = { ro: 'pending_fh', fh: 'pending_ia', ia: 'closed' }[opts.role];
    await AuditTimeline.update(
      { status: next } as any,
      { where: { id: opts.timelineId } as any },
    );
    if (next === 'closed') {
      const tl: any = await AuditTimeline.findByPk(opts.timelineId);
      await AuditSection.update(
        { status: 'Implemented' as ObservationStatus } as any,
        { where: { id: tl.sectionId } as any },
      );
    }
    return AuditTimeline.findByPk(opts.timelineId);
  }

  /** Reject — sends back to process owner with comment. */
  async resubmit(opts: { timelineId: number; userId: number; comment: string }) {
    await AuditTimeline.update(
      { status: 'resubmit', resubmitComment: opts.comment } as any,
      { where: { id: opts.timelineId } as any },
    );
    return AuditTimeline.findByPk(opts.timelineId);
  }

  /** Process owner requests timeline change. */
  async requestRevise(opts: {
    auditId: number;
    sectionId: number;
    userId: number;
    newTimeline: Date;
    comment: string;
  }) {
    return AuditRevise.create({
      auditId: opts.auditId,
      sectionId: opts.sectionId,
      userId: opts.userId,
      timeline: opts.newTimeline,
      comment: opts.comment,
      currentStatus: '1',
      postStatus: 'pending_ro',
      themeId: 0,
    } as any);
  }

  async categories() {
    return AuditCategory.findAll();
  }
  async themes() {
    return AuditTheme.findAll();
  }
  async internalTeam() {
    return AuditInternalTeam.findAll();
  }

  /** Returns sections whose timeline is approaching/past cutoff for the escalation cron. */
  async sectionsForEscalation(target: 'before_30' | 'on_cutoff' | 'after_7' | 'after_15') {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let from: Date;
    let to: Date;
    if (target === 'before_30') {
      from = addDays(today, 30);
      to = addDays(today, 30);
    } else if (target === 'on_cutoff') {
      from = today;
      to = today;
    } else if (target === 'after_7') {
      from = addDays(today, -7);
      to = addDays(today, -7);
    } else {
      from = addDays(today, -15);
      to = addDays(today, -15);
    }
    return AuditSection.findAll({
      where: {
        isDeleted: '0',
        status: { [Op.or]: [null, 'Not Implemented', 'Partially Implemented'] },
        timeline: { [Op.between]: [from, to] },
      } as any,
    });
  }

  private async log(sectionId: number, userId: number, action: string) {
    await AuditSectionLog.create({
      sectionId,
      userId,
      action,
      createdOn: new Date(),
    } as any);
  }
}

function addDays(d: Date, n: number) {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}
