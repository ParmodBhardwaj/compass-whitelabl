import { Injectable, NotFoundException } from '@nestjs/common';
import {
  HeroKpointVideos,
  HeroKpointLinks,
  HeroKpointDashboard,
  HeroKpointDisclaimer,
} from '@hero/db/src/models/generated';

/**
 * KPoint — Wave 2 module.
 *
 * kPoint is Hero's video learning platform.  The legacy portal shows:
 *   • Dashboard banners with cover images and video-type tags
 *   • A link tree (hero_kpoint_links, hierarchical parentId)
 *   • Videos filtered by type / language (hero_kpoint_videos)
 *   • A disclaimer paragraph (hero_kpoint_disclaimer)
 *
 * Tables:
 *   hero_kpoint_dashboard  — homepage banners/tiles
 *   hero_kpoint_links      — section link tree
 *   hero_kpoint_videos     — video entries
 *   hero_kpoint_disclaimer — disclaimer text
 */
@Injectable()
export class KpointService {
  // ── Dashboard ─────────────────────────────────────────────────────────────

  async getDashboard() {
    return HeroKpointDashboard.findAll({
      where: { status: '1' } as any,
      order: [['id', 'ASC']],
    });
  }

  async createDashboardItem(dto: {
    title: string;
    image?: string;
    imageLink?: string;
    videoType?: string;
    dealerVisible?: string;
    status?: string;
  }) {
    return HeroKpointDashboard.create({
      title: dto.title,
      image: dto.image ?? null,
      imageLink: dto.imageLink ?? null,
      videoType: dto.videoType ?? null,
      dealerVisible: dto.dealerVisible ?? '0',
      status: dto.status ?? '1',
    } as any);
  }

  async updateDashboardItem(id: number, dto: Partial<{
    title: string;
    image: string;
    imageLink: string;
    videoType: string;
    dealerVisible: string;
    status: string;
  }>) {
    const row = await HeroKpointDashboard.findByPk(id);
    if (!row) throw new NotFoundException('Dashboard item not found');
    await row.update(dto as any);
    return row;
  }

  async deleteDashboardItem(id: number) {
    const row = await HeroKpointDashboard.findByPk(id);
    if (!row) throw new NotFoundException();
    await row.destroy();
    return { id, deleted: true };
  }

  // ── Links (section tree) ─────────────────────────────────────────────────

  async getLinks(parentId?: number) {
    const where: any = {};
    if (parentId !== undefined) where.parentId = parentId;
    else where.parentId = 0; // top-level
    return HeroKpointLinks.findAll({
      where: { ...where, status: '1' } as any,
      order: [['ordering', 'ASC']],
    });
  }

  async getLinkTree() {
    const all = await HeroKpointLinks.findAll({
      where: { status: '1' } as any,
      order: [['ordering', 'ASC']],
      raw: true,
    }) as any[];

    // Build hierarchical tree
    const map = new Map<number, any>();
    const roots: any[] = [];
    all.forEach(l => map.set(l.id, { ...l, children: [] }));
    all.forEach(l => {
      const node = map.get(l.id)!;
      if (l.parentId && l.parentId !== 0 && map.has(l.parentId)) {
        map.get(l.parentId)!.children.push(node);
      } else {
        roots.push(node);
      }
    });
    return roots;
  }

  async createLink(dto: {
    parentId?: number;
    title: string;
    alias?: string;
    section?: string;
    ordering?: number;
    status?: string;
    mappingId?: number;
  }) {
    return HeroKpointLinks.create({
      parentId: dto.parentId ?? 0,
      title: dto.title,
      alias: dto.alias ?? dto.title.toLowerCase().replace(/\s+/g, '-'),
      section: dto.section ?? null,
      ordering: dto.ordering ?? 0,
      status: dto.status ?? '1',
      mappingId: dto.mappingId ?? null,
    } as any);
  }

  async updateLink(id: number, dto: Partial<{
    parentId: number;
    title: string;
    alias: string;
    section: string;
    ordering: number;
    status: string;
    mappingId: number;
  }>) {
    const row = await HeroKpointLinks.findByPk(id);
    if (!row) throw new NotFoundException('Link not found');
    await row.update(dto as any);
    return row;
  }

  async deleteLink(id: number) {
    const row = await HeroKpointLinks.findByPk(id);
    if (!row) throw new NotFoundException();
    await row.destroy();
    return { id, deleted: true };
  }

  // ── Videos ──────────────────────────────────────────────────────────────

  async getVideos(opts: { type?: string; language?: string; videoLinkId?: number } = {}) {
    const where: any = {};
    if (opts.type) where.type = opts.type;
    if (opts.language) where.language = opts.language;
    if (opts.videoLinkId) where.videoLinkId = opts.videoLinkId;
    return HeroKpointVideos.findAll({ where, order: [['id', 'ASC']] });
  }

  async getVideo(id: number) {
    const v = await HeroKpointVideos.findByPk(id);
    if (!v) throw new NotFoundException('Video not found');
    return v;
  }

  async createVideo(dto: {
    videoLinkId?: number;
    type?: string;
    language?: string;
    videoLink: string;
    countryId?: number;
    languageId?: number;
  }) {
    return HeroKpointVideos.create({
      videoLinkId: dto.videoLinkId ?? null,
      type: dto.type ?? null,
      language: dto.language ?? null,
      videoLink: dto.videoLink,
      countryId: dto.countryId ?? null,
      languageId: dto.languageId ?? null,
    } as any);
  }

  async updateVideo(id: number, dto: Partial<{
    videoLinkId: number;
    type: string;
    language: string;
    videoLink: string;
    countryId: number;
    languageId: number;
  }>) {
    const row = await HeroKpointVideos.findByPk(id);
    if (!row) throw new NotFoundException('Video not found');
    await row.update(dto as any);
    return row;
  }

  async deleteVideo(id: number) {
    const row = await HeroKpointVideos.findByPk(id);
    if (!row) throw new NotFoundException();
    await row.destroy();
    return { id, deleted: true };
  }

  // ── Disclaimer ───────────────────────────────────────────────────────────

  async getDisclaimer() {
    return HeroKpointDisclaimer.findOne({
      order: [['id', 'ASC']],
    });
  }
}
