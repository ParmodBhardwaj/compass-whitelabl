import { Injectable, NotFoundException } from '@nestjs/common';
import { Message } from '@hero/db/src/models/generated';

/**
 * CEO Message — Wave 1 module.
 *
 * Simple content module. Admins post CEO/leadership messages with
 * an optional image. Employees see the latest message on demand.
 *
 * Table: message
 */
@Injectable()
export class CeoMessageService {
  async list() {
    return Message.findAll({ order: [['id', 'DESC']] });
  }

  async getLatest() {
    return Message.findOne({ order: [['id', 'DESC']] });
  }

  async getById(id: number) {
    const m = await Message.findByPk(id);
    if (!m) throw new NotFoundException('Message not found');
    return m;
  }

  async create(dto: { title: string; description?: string; image?: string }) {
    return Message.create({
      title: dto.title,
      description: dto.description ?? null,
      image: dto.image ?? null,
    } as any);
  }

  async update(id: number, dto: Partial<{ title: string; description: string; image: string }>) {
    const m = await Message.findByPk(id);
    if (!m) throw new NotFoundException('Message not found');
    await m.update(dto as any);
    return m;
  }

  async delete(id: number) {
    const m = await Message.findByPk(id);
    if (!m) throw new NotFoundException();
    await m.destroy();
    return { id, deleted: true };
  }
}
