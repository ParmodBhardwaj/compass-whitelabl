import { Injectable, NotFoundException } from '@nestjs/common';
import { News } from '@hero/db/src/models/generated';
import { Op } from '@hero/db';

export interface NewsDto {
  title?: string;
  alias?: string;
  newsType: '0' | '1'; // 0 = external, 1 = internal
  externalLink?: string;
  shortDescription?: string;
  description?: string;
  newsDate: string; // YYYY-MM-DD
  image?: string;
  metaKeywords?: string;
  metaTitle?: string;
  metaDescription?: string;
  isFeatured?: '0' | '1';
  store: number;
  status?: '0' | '1';
}

/** news.news_type: '0' = External, '1' = Internal. */
@Injectable()
export class NewsService {
  async list(opts: {
    storeId: number;
    type?: '0' | '1';
    featured?: boolean;
    limit?: number;
    q?: string;
    status?: '0' | '1';
  }) {
    const where: any = { store: opts.storeId };
    if (opts.status) where.status = opts.status;
    if (opts.type) where.newsType = opts.type;
    if (opts.featured) where.isFeatured = '1';
    if (opts.q) where.title = { [Op.like]: `%${opts.q}%` };
    return News.findAll({
      where,
      order: [['newsDate', 'DESC']],
      limit: opts.limit ?? 50,
    });
  }

  async byAlias(alias: string) {
    return News.findOne({ where: { alias, status: '1' } as any });
  }

  async byId(id: number) {
    return News.findByPk(id);
  }

  // ----- admin CRUD -----
  async create(dto: NewsDto) {
    return News.create({
      title: dto.title,
      alias: dto.alias ?? slug(dto.title ?? ''),
      newsType: dto.newsType,
      externalLink: dto.externalLink ?? '',
      shortDescription: dto.shortDescription,
      description: dto.description,
      newsDate: dto.newsDate,
      image: dto.image,
      metaKeywords: dto.metaKeywords,
      metaTitle: dto.metaTitle,
      metaDescription: dto.metaDescription,
      isFeatured: dto.isFeatured ?? '0',
      store: dto.store,
      status: dto.status ?? '0',
    } as any);
  }

  async update(id: number, dto: Partial<NewsDto>) {
    const row = await News.findByPk(id);
    if (!row) throw new NotFoundException();
    await row.update(dto as any);
    return row;
  }

  async remove(id: number) {
    const row = await News.findByPk(id);
    if (!row) throw new NotFoundException();
    await row.destroy();
    return { id, deleted: true };
  }
}

function slug(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').slice(0, 255);
}
