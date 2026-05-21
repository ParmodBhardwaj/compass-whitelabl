import { Injectable } from '@nestjs/common';
import { Op } from '@hero/db';
import { SopFeedback, SopAdminUser } from '@hero/db/src/models/generated';
import { sendMail } from '@hero/integrations';

@Injectable()
export class SopFeedbackService {
  async list(opts: { procedureId?: number; q?: string; from?: string; to?: string }) {
    const where: any = {};
    if (opts.procedureId) where.procedureId = opts.procedureId;
    if (opts.q) where.feedback = { [Op.like]: `%${opts.q}%` };
    if (opts.from || opts.to) {
      where.feedbackDate = {};
      if (opts.from) where.feedbackDate[Op.gte] = opts.from;
      if (opts.to) where.feedbackDate[Op.lte] = opts.to;
    }
    return SopFeedback.findAll({ where, order: [['feedbackDate', 'DESC']] });
  }

  async submit(userId: number, procedureId: number, message: string) {
    const fb = await SopFeedback.create({
      procedureId,
      feedback: message,
      feedbackDate: new Date(),
      createdBy: userId,
      status: '0',
    } as any);
    // Notify SOP admins for this process. The admin link is via process_id, but
    // sop_feedback only has procedure_id — caller resolves and passes admins.
    await this.notifyAdmins(procedureId, message).catch(() => undefined);
    return fb;
  }

  async reply(id: number, replyText: string) {
    await SopFeedback.update(
      { feedbackReply: replyText, status: '1' } as any,
      { where: { id } as any },
    );
    // Mail goes back to the original feedback submitter — caller looks up email.
    return SopFeedback.findByPk(id);
  }

  private async notifyAdmins(procedureId: number, message: string) {
    // Admin lookup uses process_id, not procedure_id — load procedure to find process.
    const admins = await SopAdminUser.findAll({ raw: true });
    if (admins.length === 0) return;
    await sendMail({
      to: 'sop-admins@example.com', // TODO: resolve emails from acl_user/employee
      subject: `New SOP feedback (procedure ${procedureId})`,
      html: `<p>New feedback received:</p><blockquote>${message}</blockquote>`,
    }).catch(() => undefined);
  }
}
