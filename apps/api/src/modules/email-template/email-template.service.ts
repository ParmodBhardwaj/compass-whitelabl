import { Injectable, NotFoundException } from '@nestjs/common';
import { Op } from '@hero/db';
import { EmailTemplate } from '@hero/db/src/models/generated';

/**
 * Email Template admin service — replicates legacy
 * `module/Miscellaneous/src/Controller/EmailTemplateController.php`.
 *
 * Table `email_template`:
 *   id, name, alias, subject, message, created_at, modified_at,
 *   status ('0'|'1'), is_deleted ('0'|'1')
 */
@Injectable()
export class EmailTemplateService {
  async list(opts: { q?: string; includeDeleted?: boolean } = {}) {
    const where: any = {};
    if (!opts.includeDeleted) where.isDeleted = '0';
    if (opts.q) {
      where[Op.or] = [
        { name: { [Op.like]: `%${opts.q}%` } },
        { subject: { [Op.like]: `%${opts.q}%` } },
        { alias: { [Op.like]: `%${opts.q}%` } },
      ];
    }
    return EmailTemplate.findAll({ where, order: [['id', 'ASC']] });
  }

  async get(id: number) {
    const t = await EmailTemplate.findByPk(id);
    if (!t) throw new NotFoundException('Email template not found');
    return t;
  }

  async create(dto: {
    name: string;
    alias?: string;
    subject: string;
    message: string;
    status?: '0' | '1';
  }) {
    return EmailTemplate.create({
      name: dto.name,
      alias: dto.alias ?? slug(dto.name),
      subject: dto.subject,
      message: dto.message,
      createdAt: new Date(),
      status: dto.status ?? '1',
      isDeleted: '0',
    } as any);
  }

  async update(id: number, dto: Partial<{
    name: string;
    alias: string;
    subject: string;
    message: string;
    status: '0' | '1';
  }>) {
    const t = await EmailTemplate.findByPk(id);
    if (!t) throw new NotFoundException('Email template not found');
    await t.update(dto as any);
    return t;
  }

  async remove(id: number) {
    const t = await EmailTemplate.findByPk(id);
    if (!t) throw new NotFoundException('Email template not found');
    await t.update({ isDeleted: '1' } as any);
    return { id, deleted: true };
  }
}

function slug(s: string) {
  return s.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 255);
}
