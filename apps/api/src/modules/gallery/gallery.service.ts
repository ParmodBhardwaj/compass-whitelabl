import { Injectable, NotFoundException } from '@nestjs/common';
import {
  HeroGallery,
  HeroGalleryCategory,
  HeroGalleryImages,
} from '@hero/db/src/models/generated';
import { Op } from '@hero/db';

export interface GalleryDto {
  title?: string;
  alias?: string;
  category?: number;
  thumbWidth?: string;
  thumbHeight?: string;
  sortorder?: number;
  store?: number;
  status?: '0' | '1';
}

export interface GalleryImageDto {
  galleryId: number;
  title?: string;
  image: string;
  thumbnail?: string;
  isFeatured?: '0' | '1';
}

export interface GalleryCategoryDto {
  name: string;
  alias?: string;
  sortorder?: number;
}

@Injectable()
export class GalleryService {
  // ---- categories ----
  async categories() {
    return HeroGalleryCategory.findAll({ order: [['sortorder', 'ASC']] });
  }
  async createCategory(dto: GalleryCategoryDto) {
    return HeroGalleryCategory.create({
      name: dto.name,
      alias: dto.alias ?? slug(dto.name),
      sortorder: dto.sortorder ?? 0,
    } as any);
  }
  async updateCategory(id: number, dto: Partial<GalleryCategoryDto>) {
    const row = await HeroGalleryCategory.findByPk(id);
    if (!row) throw new NotFoundException();
    await row.update(dto as any);
    return row;
  }
  async deleteCategory(id: number) {
    const row = await HeroGalleryCategory.findByPk(id);
    if (!row) throw new NotFoundException();
    await row.destroy();
    return { id, deleted: true };
  }

  // ---- galleries (front-end only sees ones with at least one image) ----
  async list(opts: { storeId: number; categoryId?: number; includeEmpty?: boolean; withCover?: boolean }) {
    const where: any = { store: opts.storeId, status: '1' };
    if (opts.categoryId) where.category = opts.categoryId;
    const galleries = await HeroGallery.findAll({
      where,
      order: [['sortorder', 'ASC']],
      raw: true,
    });
    if (galleries.length === 0) return [];

    const ids = galleries.map((g: any) => g.id);
    const images = await HeroGalleryImages.findAll({
      where: { galleryId: { [Op.in]: ids } } as any,
      raw: true,
    });

    // Build cover-image and count maps
    const counts = new Map<number, number>();
    const covers = new Map<number, string>();
    for (const img of images as any[]) {
      const gid: number = img.gallery_id ?? img.galleryId;
      counts.set(gid, (counts.get(gid) ?? 0) + 1);
      // Featured image wins; otherwise first image encountered
      if (!covers.has(gid) || img.is_featured === '1' || img.isFeatured === '1') {
        covers.set(gid, img.thumbnail ?? img.image ?? '');
      }
    }

    const filtered = opts.includeEmpty
      ? galleries
      : (galleries as any[]).filter((g: any) => (counts.get(g.id) ?? 0) > 0);

    if (!opts.withCover) return filtered;

    // Attach coverImage to each gallery object
    return (filtered as any[]).map((g: any) => ({
      ...g,
      coverImage: covers.get(g.id) ?? null,
      imageCount: counts.get(g.id) ?? 0,
    }));
  }

  async listAdmin() {
    return HeroGallery.findAll({ order: [['sortorder', 'ASC']] });
  }

  async byAlias(alias: string) {
    const g = await HeroGallery.findOne({ where: { alias, status: '1' } as any, raw: true });
    if (!g) return null;
    const images = await HeroGalleryImages.findAll({
      where: { galleryId: (g as any).id } as any,
      order: [['createdAt', 'DESC']],
    });
    return { gallery: g, images };
  }

  async byId(id: number) {
    const g = await HeroGallery.findByPk(id);
    if (!g) return null;
    const images = await HeroGalleryImages.findAll({
      where: { galleryId: id } as any,
      order: [['createdAt', 'DESC']],
    });
    return { gallery: g, images };
  }

  async create(dto: GalleryDto) {
    return HeroGallery.create({
      title: dto.title,
      alias: dto.alias ?? slug(dto.title ?? ''),
      category: dto.category ?? null,
      thumbWidth: dto.thumbWidth ?? null,
      thumbHeight: dto.thumbHeight ?? null,
      sortorder: dto.sortorder ?? 0,
      createdAt: new Date(),
      store: dto.store ?? 1,
      status: dto.status ?? '1',
    } as any);
  }

  async update(id: number, dto: Partial<GalleryDto>) {
    const row = await HeroGallery.findByPk(id);
    if (!row) throw new NotFoundException();
    await row.update(dto as any);
    return row;
  }

  async remove(id: number) {
    const row = await HeroGallery.findByPk(id);
    if (!row) throw new NotFoundException();
    await HeroGalleryImages.destroy({ where: { galleryId: id } as any });
    await row.destroy();
    return { id, deleted: true };
  }

  // ---- images ----
  async addImages(galleryId: number, images: Array<Omit<GalleryImageDto, 'galleryId'>>) {
    const rows = images.map((i) => ({
      galleryId,
      title: i.title,
      image: i.image,
      thumbnail: i.thumbnail ?? i.image,
      isFeatured: i.isFeatured ?? '0',
      createdAt: new Date(),
    }));
    return HeroGalleryImages.bulkCreate(rows as any);
  }

  async removeImages(ids: number[]) {
    await HeroGalleryImages.destroy({ where: { id: { [Op.in]: ids } } as any });
    return { ok: true, count: ids.length };
  }

  async setFeatured(imageId: number, featured: '0' | '1') {
    const img = await HeroGalleryImages.findByPk(imageId);
    if (!img) throw new NotFoundException();
    await img.update({ isFeatured: featured } as any);
    return img;
  }
}

function slug(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').slice(0, 255);
}
