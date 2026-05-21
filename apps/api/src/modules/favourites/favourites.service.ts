import { Injectable, NotFoundException } from '@nestjs/common';
import { HeroFavourite } from '@hero/db/src/models/generated';

export interface FavouriteDto {
  title: string;
  url: string;
  menuId: number;
  newWindow?: '0' | '1';
}

@Injectable()
export class FavouritesService {
  async listForUser(userId: number) {
    return HeroFavourite.findAll({ where: { userId } as any, order: [['id', 'DESC']] });
  }

  async add(userId: number, dto: FavouriteDto) {
    // Treat (user_id, menu_id) as unique-ish — upsert behavior.
    const existing = await HeroFavourite.findOne({
      where: { userId, menuId: dto.menuId } as any,
    });
    if (existing) return existing;
    return HeroFavourite.create({
      userId,
      title: dto.title,
      url: dto.url,
      menuId: dto.menuId,
      newWindow: dto.newWindow ?? '0',
    } as any);
  }

  async remove(userId: number, id: number) {
    const row = await HeroFavourite.findOne({ where: { id, userId } as any });
    if (!row) throw new NotFoundException();
    await row.destroy();
    return { id, deleted: true };
  }

  async removeByMenu(userId: number, menuId: number) {
    const n = await HeroFavourite.destroy({ where: { userId, menuId } as any });
    return { menuId, deleted: n };
  }
}
