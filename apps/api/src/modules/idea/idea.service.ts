import { Injectable, NotFoundException } from '@nestjs/common';
import { Op } from '@hero/db';
import {
  IdeaPortal,
  IdeaPortalCategory,
  IdeaSubmitted,
  IdeaSubmittedUsers,
  IdeaAdminUser,
  IdeaBanners,
  IdeaBannerContent,
} from '@hero/db/src/models/generated';

/**
 * Idea Portal — Wave 2 module.
 *
 * Employees submit ideas for improvement against active idea campaigns.
 *
 * Tables:
 *   idea_portal            — idea campaigns (with start/end dates, team size)
 *   idea_portal_category   — categories per campaign
 *   idea_submitted         — submitted idea entries
 *   idea_submitted_users   — group idea submissions (multiple submitters)
 *   idea_admin_user        — admins per campaign
 *   idea_banners           — campaign banners
 *   idea_banner_content    — banner slide content
 */
@Injectable()
export class IdeaService {
  // ── Campaigns (idea_portal) ──────────────────────────────────────────────────

  async listCampaigns(opts: { status?: string; all?: boolean } = {}) {
    const where: any = {};
    if (opts.status) where.status = opts.status;
    return IdeaPortal.findAll({ where, order: [['ideaId', 'DESC']] });
  }

  async getCampaign(id: number) {
    const portal = await IdeaPortal.findByPk(id);
    if (!portal) throw new NotFoundException('Campaign not found');
    const categories = await IdeaPortalCategory.findAll({
      where: { ideaId: id } as any,
      order: [['id', 'ASC']],
    });
    const banners = await IdeaBanners.findAll({
      where: { ideaId: id } as any,
    });
    return { portal, categories, banners };
  }

  async createCampaign(dto: {
    title: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    status?: string;
    groupAllowed?: string;
    createdBy?: number;
  }) {
    return IdeaPortal.create({
      title: dto.title,
      description: dto.description ?? null,
      startForm: dto.startDate ?? null,
      startEnd: dto.endDate ?? null,
      status: dto.status ?? 'active',
      groupAllowed: dto.groupAllowed ?? '0',
      createdBy: dto.createdBy ?? null,
    } as any);
  }

  async updateCampaign(id: number, dto: Partial<{
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    status: string;
    groupAllowed: string;
  }>) {
    const portal = await IdeaPortal.findByPk(id);
    if (!portal) throw new NotFoundException('Campaign not found');
    const update: any = {};
    if (dto.title !== undefined) update.title = dto.title;
    if (dto.description !== undefined) update.description = dto.description;
    if (dto.startDate !== undefined) update.startForm = dto.startDate;
    if (dto.endDate !== undefined) update.startEnd = dto.endDate;
    if (dto.status !== undefined) update.status = dto.status;
    if (dto.groupAllowed !== undefined) update.groupAllowed = dto.groupAllowed;
    await portal.update(update);
    return portal;
  }

  async getActiveCampaigns() {
    const today = new Date().toISOString().slice(0, 10);
    return IdeaPortal.findAll({
      where: {
        status: '1',
        startForm: { [Op.lte]: today },
        startEnd: { [Op.gte]: today },
      } as any,
      order: [['startForm', 'DESC']],
    });
  }

  // ── Submissions ─────────────────────────────────────────────────────────────

  async listSubmissions(opts: {
    ideaId?: number;
    submittedBy?: number;
    all?: boolean;
  } = {}) {
    const where: any = {};
    if (opts.ideaId) where.ideaId = opts.ideaId;
    if (!opts.all && opts.submittedBy) where.submittedBy = opts.submittedBy;
    return IdeaSubmitted.findAll({
      where,
      order: [['createdOn', 'DESC']],
    });
  }

  async getSubmission(id: number) {
    const sub = await IdeaSubmitted.findByPk(id);
    if (!sub) throw new NotFoundException('Submission not found');
    const users = await IdeaSubmittedUsers.findAll({
      where: { submittedId: id } as any,
    });
    return { submission: sub, users };
  }

  async createSubmission(dto: {
    ideaId: number;
    categoryId?: number;
    title: string;
    shortDescription?: string;
    description: string;
    attachment?: string;
    isGroup?: string;
    submittedBy: number;
    teamUserIds?: number[];
  }) {
    // Legacy idea_submitted schema marks category_id and short_description
    // NOT NULL — default both to safe empty values so MySQL doesn't reject.
    const sub = await IdeaSubmitted.create({
      ideaId: dto.ideaId,
      isGroup: dto.isGroup ?? '0',
      ideaIndex: null,
      categoryId: dto.categoryId ?? 0,
      title: dto.title,
      shortDescription: dto.shortDescription ?? '',
      description: dto.description,
      attachment: dto.attachment ?? null,
      submittedBy: dto.submittedBy,
      createdOn: new Date().toISOString().slice(0, 10),
      updatedOn: null,
    } as any);

    // Add team members for group submissions
    if (dto.isGroup === '1' && dto.teamUserIds?.length) {
      for (const uid of dto.teamUserIds) {
        await IdeaSubmittedUsers.create({
          submittedId: (sub as any).id,
          userId: uid,
        } as any);
      }
    }

    return sub;
  }

  async updateSubmission(id: number, dto: Partial<{
    title: string;
    shortDescription: string;
    description: string;
    attachment: string;
    categoryId: number;
  }>) {
    const sub = await IdeaSubmitted.findByPk(id);
    if (!sub) throw new NotFoundException('Submission not found');
    await sub.update({ ...dto, updatedOn: new Date().toISOString().slice(0, 10) } as any);
    return sub;
  }

  async deleteSubmission(id: number) {
    const sub = await IdeaSubmitted.findByPk(id);
    if (!sub) throw new NotFoundException('Submission not found');
    await sub.destroy();
    return { id, deleted: true };
  }

  // ── Banners ──────────────────────────────────────────────────────────────────

  async getBannerContent(bannerId: number) {
    return IdeaBannerContent.findAll({
      where: { bannerId } as any,
      order: [['id', 'ASC']],
    });
  }
}
