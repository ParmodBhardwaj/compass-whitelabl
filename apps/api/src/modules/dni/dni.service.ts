import { Injectable, NotFoundException } from '@nestjs/common';
import {
  HeroDiEvents,
  HeroDiEventsCategory,
  HeroDiFeatured,
  HeroDiInitiative,
  HeroDiNewsletter,
  HeroDiVideo,
} from '@hero/db/src/models/generated';

/**
 * D&I (Diversity & Inclusion) Portal — Wave 3 module.
 *
 * Information portal for Hero's Diversity & Inclusion initiatives.
 * Shows events, initiatives, featured stories, newsletters, and videos.
 *
 * Tables:
 *   hero_di_events          — D&I events
 *   hero_di_events_category — event categories
 *   hero_di_featured        — featured stories
 *   hero_di_initiative      — D&I initiatives
 *   hero_di_newsletter      — newsletters
 *   hero_di_video           — D&I videos
 */
@Injectable()
export class DniService {
  // ── Events ───────────────────────────────────────────────────────────────────

  async listEvents(opts: { storeId?: number; categoryId?: number; status?: string } = {}) {
    const where: any = { isDeleted: '0' };
    if (opts.storeId) where.storeId = opts.storeId;
    if (opts.categoryId) where.categoryId = opts.categoryId;
    if (opts.status !== undefined) where.status = opts.status;
    else where.status = '1';
    return HeroDiEvents.findAll({
      where,
      order: [['startDate', 'DESC']],
    });
  }

  async getEvent(id: number) {
    const e = await HeroDiEvents.findOne({ where: { id, isDeleted: '0' } as any });
    if (!e) throw new NotFoundException('Event not found');
    return e;
  }

  async createEvent(dto: {
    title: string;
    shortDescription?: string;
    description?: string;
    eventType?: string;
    externalLink?: string;
    categoryId?: number;
    startDate?: string;
    endDate?: string;
    startTime?: string;
    endTime?: string;
    image?: string;
    location?: string;
    storeId?: number;
    sortOrder?: number;
    status?: string;
    isFeatured?: string;
  }) {
    // hero_di_events: string/date columns are NOT NULL — default to empty string
    const today = new Date().toISOString().slice(0, 10);
    return HeroDiEvents.create({
      title: dto.title,
      alias: dto.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      shortDescription: dto.shortDescription ?? '',
      description: dto.description ?? '',
      eventType: dto.eventType ?? 'event',
      externalLink: dto.externalLink ?? '',
      categoryId: dto.categoryId ?? null,
      startDate: dto.startDate ?? today,
      endDate: dto.endDate ?? today,
      startTime: dto.startTime ?? null,
      endTime: dto.endTime ?? null,
      image: dto.image ?? '',
      location: dto.location ?? '',
      storeId: dto.storeId ?? 1,
      sortOrder: dto.sortOrder ?? 0,
      status: dto.status ?? '1',
      isFeatured: dto.isFeatured ?? '0',
      isDeleted: '0',
      createdAt: new Date(),
    } as any);
  }

  async updateEvent(id: number, dto: any) {
    const e = await HeroDiEvents.findByPk(id);
    if (!e) throw new NotFoundException('Event not found');
    await e.update(dto as any);
    return e;
  }

  async deleteEvent(id: number) {
    const e = await HeroDiEvents.findByPk(id);
    if (!e) throw new NotFoundException();
    await e.update({ isDeleted: '1' } as any);
    return { id, deleted: true };
  }

  async eventCategories() {
    return HeroDiEventsCategory.findAll({ order: [['id', 'ASC']] });
  }

  // ── Initiatives ──────────────────────────────────────────────────────────────

  async listInitiatives(storeId = 1) {
    return HeroDiInitiative.findAll({
      where: { status: '1', isDeleted: '0', storeId } as any,
      order: [['sortOrder', 'ASC']],
    });
  }

  async createInitiative(dto: {
    name: string;
    shortDescription?: string;
    description?: string;
    image?: string;
    storeId?: number;
    sortOrder?: number;
    status?: string;
    isFeatured?: string;
  }) {
    // shortDescription/description/image are NOT NULL — default to empty string
    return HeroDiInitiative.create({
      name: dto.name,
      alias: dto.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      shortDescription: dto.shortDescription ?? '',
      description: dto.description ?? '',
      image: dto.image ?? '',
      storeId: dto.storeId ?? 1,
      sortOrder: dto.sortOrder ?? 0,
      status: dto.status ?? '1',
      isFeatured: dto.isFeatured ?? '0',
      isDeleted: '0',
      createdAt: new Date(),
    } as any);
  }

  async updateInitiative(id: number, dto: any) {
    const row = await HeroDiInitiative.findByPk(id);
    if (!row) throw new NotFoundException('Initiative not found');
    await row.update(dto as any);
    return row;
  }

  async deleteInitiative(id: number) {
    const row = await HeroDiInitiative.findByPk(id);
    if (!row) throw new NotFoundException();
    await row.update({ isDeleted: '1' } as any);
    return { id, deleted: true };
  }

  async getInitiativeByAlias(alias: string) {
    const row = await HeroDiInitiative.findOne({
      where: { alias, isDeleted: '0' } as any,
    });
    if (!row) throw new NotFoundException('Initiative not found');
    return row;
  }

  async getEventByAlias(alias: string) {
    const row = await HeroDiEvents.findOne({
      where: { alias, isDeleted: '0' } as any,
    });
    if (!row) throw new NotFoundException('Event not found');
    return row;
  }

  // ── Featured stories ─────────────────────────────────────────────────────────

  async listFeatured(storeId = 1) {
    return HeroDiFeatured.findAll({
      where: { status: '1', isDeleted: '0', storeId } as any,
      order: [['featuredDate', 'DESC']],
    });
  }

  async getFeaturedByAlias(alias: string) {
    const row = await HeroDiFeatured.findOne({ where: { alias, isDeleted: '0' } as any });
    if (!row) throw new NotFoundException('Featured story not found');
    return row;
  }

  async createFeatured(dto: {
    title: string;
    shortDescription?: string;
    description?: string;
    featuredDate?: string;
    image?: string;
    storeId?: number;
    sortOrder?: number;
    status?: string;
    isFeatured?: string;
  }) {
    const today = new Date().toISOString().slice(0, 10);
    return HeroDiFeatured.create({
      title: dto.title,
      alias: makeAlias(dto.title),
      shortDescription: dto.shortDescription ?? '',
      description: dto.description ?? '',
      featuredDate: dto.featuredDate ?? today,
      image: dto.image ?? '',
      storeId: dto.storeId ?? 1,
      sortOrder: dto.sortOrder ?? 0,
      status: dto.status ?? '1',
      isFeatured: dto.isFeatured ?? '0',
      isDeleted: '0',
      createdAt: new Date(),
    } as any);
  }

  async updateFeatured(id: number, dto: any) {
    const row = await HeroDiFeatured.findByPk(id);
    if (!row) throw new NotFoundException('Featured story not found');
    await row.update(dto as any);
    return row;
  }

  async deleteFeatured(id: number) {
    const row = await HeroDiFeatured.findByPk(id);
    if (!row) throw new NotFoundException();
    await row.update({ isDeleted: '1' } as any);
    return { id, deleted: true };
  }

  // ── Newsletters ──────────────────────────────────────────────────────────────

  async listNewsletters(storeId = 1) {
    return HeroDiNewsletter.findAll({
      where: { status: '1', isDeleted: '0', storeId } as any,
      order: [['sortOrder', 'ASC']],
    });
  }

  async getNewsletterByAlias(alias: string) {
    const row = await HeroDiNewsletter.findOne({ where: { alias, isDeleted: '0' } as any });
    if (!row) throw new NotFoundException('Newsletter not found');
    return row;
  }

  async createNewsletter(dto: {
    name: string;
    shortDescription?: string;
    description?: string;
    image?: string;
    storeId?: number;
    sortOrder?: number;
    status?: string;
    isFeatured?: string;
  }) {
    return HeroDiNewsletter.create({
      name: dto.name,
      alias: makeAlias(dto.name),
      shortDescription: dto.shortDescription ?? '',
      description: dto.description ?? '',
      image: dto.image ?? '',
      storeId: dto.storeId ?? 1,
      sortOrder: dto.sortOrder ?? 0,
      status: dto.status ?? '1',
      isFeatured: dto.isFeatured ?? '0',
      isDeleted: '0',
      createdAt: new Date(),
    } as any);
  }

  async updateNewsletter(id: number, dto: any) {
    const row = await HeroDiNewsletter.findByPk(id);
    if (!row) throw new NotFoundException('Newsletter not found');
    await row.update(dto as any);
    return row;
  }

  async deleteNewsletter(id: number) {
    const row = await HeroDiNewsletter.findByPk(id);
    if (!row) throw new NotFoundException();
    await row.update({ isDeleted: '1' } as any);
    return { id, deleted: true };
  }

  // ── Videos ───────────────────────────────────────────────────────────────────

  async listVideos(storeId = 1) {
    return HeroDiVideo.findAll({
      where: { status: '1', isDeleted: '0', storeId } as any,
      order: [['sortOrder', 'ASC']],
    });
  }

  async getVideoByAlias(alias: string) {
    const row = await HeroDiVideo.findOne({ where: { alias, isDeleted: '0' } as any });
    if (!row) throw new NotFoundException('Video not found');
    return row;
  }

  async createVideo(dto: {
    name: string;
    shortDescription?: string;
    description?: string;
    image?: string;
    storeId?: number;
    sortOrder?: number;
    status?: string;
    isFeatured?: string;
  }) {
    return HeroDiVideo.create({
      name: dto.name,
      alias: makeAlias(dto.name),
      shortDescription: dto.shortDescription ?? '',
      description: dto.description ?? '',
      image: dto.image ?? '',
      storeId: dto.storeId ?? 1,
      sortOrder: dto.sortOrder ?? 0,
      status: dto.status ?? '1',
      isFeatured: dto.isFeatured ?? '0',
      isDeleted: '0',
      createdAt: new Date(),
    } as any);
  }

  async updateVideo(id: number, dto: any) {
    const row = await HeroDiVideo.findByPk(id);
    if (!row) throw new NotFoundException('Video not found');
    await row.update(dto as any);
    return row;
  }

  async deleteVideo(id: number) {
    const row = await HeroDiVideo.findByPk(id);
    if (!row) throw new NotFoundException();
    await row.update({ isDeleted: '1' } as any);
    return { id, deleted: true };
  }

  // ── Dashboard aggregator ──────────────────────────────────────────────────
  //
  // Legacy `DnI\Controller\HomeController::indexAction` returned a single
  // payload combining initiatives + featured + events + videos + newsletters
  // for the landing page so the client only needs one round-trip.

  async getDashboard(storeId = 1) {
    const [initiatives, featured, events, newsletters, videos] = await Promise.all([
      this.listInitiatives(storeId),
      HeroDiFeatured.findAll({
        where: { status: '1', isDeleted: '0', storeId } as any,
        order: [['featuredDate', 'DESC']],
        limit: 6,
      }),
      HeroDiEvents.findAll({
        where: { status: '1', isDeleted: '0', storeId } as any,
        order: [['startDate', 'DESC']],
        limit: 6,
      }),
      this.listNewsletters(storeId),
      this.listVideos(storeId),
    ]);
    return { initiatives, featured, events, newsletters, videos };
  }
}

/** Slugify a title into a URL-safe alias. Matches legacy PHP slug rules. */
function makeAlias(title: string): string {
  return title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}
