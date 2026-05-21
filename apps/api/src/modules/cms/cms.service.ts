import { Injectable, NotFoundException } from '@nestjs/common';
import { Op } from '@hero/db';
import { HeroCmsPages, HeroCmsImages } from '@hero/db/src/models/generated';

export interface CmsPageDto {
  title?: string;
  alias?: string;
  shortDescription?: string;
  description?: string;
  store?: number;
  metaKeywords?: string;
  metaTitle?: string;
  metaDescription?: string;
  status?: '0' | '1';
  roleId?: number | null;
}

export interface CmsImageDto {
  pageId: number;
  title?: string;
  image: string;
  thumbnail?: string;
  isFeatured?: '0' | '1';
}

@Injectable()
export class CmsService {
  // ---------- public/front-end reads ----------
  async listPages(opts: { storeId?: number; q?: string; status?: '0' | '1' }) {
    const where: any = {};
    if (opts.status) where.status = opts.status;
    if (opts.storeId) where.store = opts.storeId;
    if (opts.q) where.title = { [Op.like]: `%${opts.q}%` };
    return HeroCmsPages.findAll({ where, order: [['id', 'DESC']] });
  }

  async pageByAlias(alias: string) {
    const page = await HeroCmsPages.findOne({ where: { alias, status: '1' } as any });
    if (!page) return null;
    const images = await HeroCmsImages.findAll({ where: { pageId: (page as any).id } as any });
    return { page, images };
  }

  async pageById(id: number) {
    const page = await HeroCmsPages.findByPk(id);
    if (!page) return null;
    const images = await HeroCmsImages.findAll({ where: { pageId: id } as any });
    return { page, images };
  }

  // ---------- admin CRUD ----------
  async createPage(dto: CmsPageDto) {
    return HeroCmsPages.create({
      title: dto.title,
      alias: dto.alias ?? slug(dto.title ?? ''),
      shortDescription: dto.shortDescription,
      description: dto.description,
      store: dto.store ?? 1,
      metaKeywords: dto.metaKeywords,
      metaTitle: dto.metaTitle,
      metaDescription: dto.metaDescription,
      status: dto.status ?? '0',
      roleId: dto.roleId ?? null,
    } as any);
  }

  async updatePage(id: number, dto: CmsPageDto) {
    const page = await HeroCmsPages.findByPk(id);
    if (!page) throw new NotFoundException();
    await page.update(dto as any);
    return page;
  }

  async deletePage(id: number) {
    const page = await HeroCmsPages.findByPk(id);
    if (!page) throw new NotFoundException();
    await HeroCmsImages.destroy({ where: { pageId: id } as any });
    await page.destroy();
    return { id, deleted: true };
  }

  async addImages(pageId: number, images: Array<Omit<CmsImageDto, 'pageId'>>) {
    const rows = images.map((i) => ({
      pageId,
      title: i.title,
      image: i.image,
      thumbnail: i.thumbnail ?? i.image,
      isFeatured: i.isFeatured ?? '0',
      createdAt: new Date(),
    }));
    return HeroCmsImages.bulkCreate(rows as any);
  }

  async deleteImage(imageId: number) {
    const img = await HeroCmsImages.findByPk(imageId);
    if (!img) throw new NotFoundException();
    await img.destroy();
    return { id: imageId, deleted: true };
  }
}

function slug(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 255);
}
