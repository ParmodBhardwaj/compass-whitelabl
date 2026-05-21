import { Injectable, NotFoundException } from '@nestjs/common';
import { Op } from '@hero/db';
import {
  Sale,
  HeroSaleCategory,
  HeroSaleSelectedCategory,
} from '@hero/db/src/models/generated';

export interface SaleDto {
  userId: number;
  title: string;
  alias?: string;
  categoryId?: number;
  type: string; // 'sale' | 'rent'
  location: string;
  latitude?: string;
  longitude?: string;
  price: number;
  description: string;
  image?: string;
}

/**
 * Sale & Rent — Wave 3 module.
 *
 * Employees post and browse sale/rental listings within the organization.
 *
 * Tables: sale, hero_sale_category, hero_sale_selected_category
 */
@Injectable()
export class SaleRentService {
  // ── Categories ───────────────────────────────────────────────────────────────

  async getCategories() {
    return HeroSaleCategory.findAll({
      where: { status: '1' } as any,
      order: [['sort', 'ASC']],
    });
  }

  // ── Listings ─────────────────────────────────────────────────────────────────

  async listListings(opts: {
    userId?: number;
    categoryId?: number;
    type?: string;
    status?: string;
    search?: string;
    all?: boolean;
  } = {}) {
    const where: any = {};
    if (opts.type) where.type = opts.type;
    if (opts.status) where.status = opts.status;
    else where.status = { [Op.ne]: 'deleted' };
    if (opts.search) {
      where.title = { [Op.like]: `%${opts.search}%` };
    }
    if (!opts.all && opts.userId) where.userId = opts.userId;
    return Sale.findAll({
      where,
      order: [['creationDate', 'DESC']],
    });
  }

  async getListing(id: number) {
    const listing = await Sale.findByPk(id);
    if (!listing) throw new NotFoundException('Listing not found');
    const selectedCategories = await HeroSaleSelectedCategory.findAll({
      where: { saleId: id } as any,
    });
    return { listing, categories: selectedCategories };
  }

  async createListing(dto: SaleDto) {
    const sale = await Sale.create({
      userId: dto.userId,
      title: dto.title,
      alias: dto.alias ?? dto.title.toLowerCase().replace(/\s+/g, '-'),
      categoryId: dto.categoryId ?? null,
      type: dto.type,
      location: dto.location,
      latitude: dto.latitude ?? null,
      longitude: dto.longitude ?? null,
      price: dto.price,
      description: dto.description,
      image: dto.image ?? null,
      // sale.status enum('1','0') — '1' = Live
      status: '1',
      creationDate: new Date(),
    } as any);

    if (dto.categoryId) {
      await HeroSaleSelectedCategory.create({
        saleId: (sale as any).id,
        categoryId: dto.categoryId,
      } as any);
    }

    return sale;
  }

  async updateListing(id: number, userId: number, dto: Partial<SaleDto>) {
    const listing = await Sale.findByPk(id);
    if (!listing) throw new NotFoundException('Listing not found');
    if ((listing as any).userId !== userId) {
      throw new NotFoundException('Not authorized to update this listing');
    }
    await listing.update(dto as any);
    return listing;
  }

  async deleteListing(id: number, userId: number) {
    const listing = await Sale.findByPk(id);
    if (!listing) throw new NotFoundException('Listing not found');
    if ((listing as any).userId !== userId) {
      throw new NotFoundException('Not authorized to delete this listing');
    }
    await listing.update({ status: 'deleted' } as any);
    return { id, deleted: true };
  }

  async markSold(id: number, userId: number) {
    const listing = await Sale.findByPk(id);
    if (!listing) throw new NotFoundException('Listing not found');
    if ((listing as any).userId !== userId) {
      throw new NotFoundException('Not authorized');
    }
    await listing.update({ status: 'sold' } as any);
    return listing;
  }

  async stats(userId?: number) {
    const base: any = { status: { [Op.ne]: 'deleted' } };
    if (userId) base.userId = userId;
    const [total, active, sold, rent, sale] = await Promise.all([
      Sale.count({ where: base }),
      Sale.count({ where: { ...base, status: 'active' } }),
      Sale.count({ where: { ...base, status: 'sold' } }),
      Sale.count({ where: { ...base, type: 'rent', status: 'active' } }),
      Sale.count({ where: { ...base, type: 'sale', status: 'active' } }),
    ]);
    return { total, active, sold, rent, sale };
  }
}
