import { Injectable, NotFoundException } from '@nestjs/common';
import { Activity } from '@hero/db/src/models/generated';
import { Op } from '@hero/db';

export interface ActivityDto {
  title?: string;
  alias?: string;
  shortDescription?: string;
  description?: string;
  activityDate?: string;
  image?: string;
  metaKeywords?: string;
  metaTitle?: string;
  metaDescription?: string;
  isFeatured?: '0' | '1';
  status?: '0' | '1';
}

@Injectable()
export class ActivityService {
  async list(opts: { featured?: boolean; q?: string; limit?: number; status?: '0' | '1' } = {}) {
    const where: any = {};
    if (opts.status) where.status = opts.status;
    if (opts.featured) where.isFeatured = '1';
    if (opts.q) where.title = { [Op.like]: `%${opts.q}%` };
    return Activity.findAll({
      where,
      order: [['activityDate', 'DESC']],
      limit: opts.limit ?? 50,
    });
  }

  async byAlias(alias: string) {
    return Activity.findOne({ where: { alias, status: '1' } as any });
  }

  async byId(id: number) {
    return Activity.findByPk(id);
  }

  async create(dto: ActivityDto) {
    return Activity.create({
      title: dto.title,
      alias: dto.alias ?? slug(dto.title ?? ''),
      shortDescription: dto.shortDescription,
      description: dto.description,
      activityDate: dto.activityDate ?? null,
      image: dto.image,
      metaKeywords: dto.metaKeywords,
      metaTitle: dto.metaTitle,
      metaDescription: dto.metaDescription,
      isFeatured: dto.isFeatured ?? '0',
      status: dto.status ?? '0',
    } as any);
  }

  async update(id: number, dto: Partial<ActivityDto>) {
    const row = await Activity.findByPk(id);
    if (!row) throw new NotFoundException();
    await row.update(dto as any);
    return row;
  }

  async remove(id: number) {
    const row = await Activity.findByPk(id);
    if (!row) throw new NotFoundException();
    await row.destroy();
    return { id, deleted: true };
  }
}

function slug(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').slice(0, 255);
}
