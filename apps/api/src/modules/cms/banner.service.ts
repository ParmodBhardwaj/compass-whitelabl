import { Injectable, NotFoundException } from '@nestjs/common';
import { HeroBanners, HomeBanners } from '@hero/db/src/models/generated';

export interface BannerDto {
  title?: string;
  content?: string;
  image?: string;
  url?: string;
  sortOrder?: number;
  isActive?: '0' | '1';
  store?: number;
}

export interface HomeBannerDto {
  image?: string;
  url?: string;
  title?: string;
}

@Injectable()
export class BannerService {
  // ---------- home_banners (main portal landing) ----------
  async homeBanners() {
    return HomeBanners.findAll({ order: [['id', 'ASC']] });
  }

  async createHome(dto: HomeBannerDto) {
    return HomeBanners.create(dto as any);
  }
  async updateHome(id: number, dto: HomeBannerDto) {
    const row = await HomeBanners.findByPk(id);
    if (!row) throw new NotFoundException();
    await row.update(dto as any);
    return row;
  }
  async deleteHome(id: number) {
    const row = await HomeBanners.findByPk(id);
    if (!row) throw new NotFoundException();
    await row.destroy();
    return { id, deleted: true };
  }

  // ---------- hero_banners (per-portal carousels, keyed by `store`) ----------
  async listByStore(storeId: number, activeOnly = false) {
    const where: any = { store: storeId };
    if (activeOnly) where.isActive = '1';
    return HeroBanners.findAll({ where, order: [['sortOrder', 'ASC']] });
  }

  async create(dto: BannerDto) {
    return HeroBanners.create({
      title: dto.title,
      content: dto.content,
      image: dto.image,
      url: dto.url,
      sortOrder: dto.sortOrder ?? 0,
      isActive: dto.isActive ?? '1',
      store: dto.store ?? 1,
    } as any);
  }

  async update(id: number, dto: BannerDto) {
    const row = await HeroBanners.findByPk(id);
    if (!row) throw new NotFoundException();
    await row.update(dto as any);
    return row;
  }

  async remove(id: number) {
    const row = await HeroBanners.findByPk(id);
    if (!row) throw new NotFoundException();
    await row.destroy();
    return { id, deleted: true };
  }
}
