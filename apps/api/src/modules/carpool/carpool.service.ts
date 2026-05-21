import { Injectable, NotFoundException } from '@nestjs/common';
import { Op } from '@hero/db';
import {
  CpRideOffers,
  CpOfficeLocations,
} from '@hero/db/src/models/generated';

export interface RideOfferDto {
  offeredBy: number;
  fromLocation: number;
  toCity?: number;
  toLocation: string;
  arivalTime: string;
  departureTime: string;
  car?: string;
  image?: string;
  latitude?: string;
  longitude?: string;
}

/**
 * Car Pool — Wave 3 module.
 *
 * Employees post and discover ride-share offers to/from office.
 *
 * Tables: cp_ride_offers, cp_office_locations
 */
@Injectable()
export class CarpoolService {
  // ── Master data ──────────────────────────────────────────────────────────────

  async getOfficeLocations() {
    return CpOfficeLocations.findAll({ order: [['sortOrder', 'ASC']] });
  }

  // ── Ride offers ──────────────────────────────────────────────────────────────

  async listOffers(opts: {
    offeredBy?: number;
    fromLocation?: number;
    toCity?: number;
    status?: string;
    all?: boolean;
  } = {}) {
    const where: any = {};
    if (opts.fromLocation) where.fromLocation = opts.fromLocation;
    if (opts.toCity) where.toCity = opts.toCity;
    if (opts.status) where.status = opts.status;
    else where.status = { [Op.ne]: 'deleted' };
    if (!opts.all && opts.offeredBy) where.offeredBy = opts.offeredBy;
    return CpRideOffers.findAll({
      where,
      order: [['createdDate', 'DESC']],
    });
  }

  async getOffer(id: number) {
    const offer = await CpRideOffers.findByPk(id);
    if (!offer) throw new NotFoundException('Ride offer not found');
    return offer;
  }

  async createOffer(dto: RideOfferDto) {
    return CpRideOffers.create({
      offeredBy: dto.offeredBy,
      fromLocation: dto.fromLocation,
      toCity: dto.toCity ?? null,
      toLocation: dto.toLocation,
      arivalTime: dto.arivalTime,
      departureTime: dto.departureTime,
      car: dto.car ?? null,
      image: dto.image ?? null,
      latitude: dto.latitude ?? null,
      longitude: dto.longitude ?? null,
      // cp_ride_offers.status enum('1','0') — '1' = Active
      status: '1',
      createdDate: new Date(),
    } as any);
  }

  async updateOffer(id: number, dto: Partial<RideOfferDto>) {
    const offer = await CpRideOffers.findByPk(id);
    if (!offer) throw new NotFoundException('Ride offer not found');
    await offer.update(dto as any);
    return offer;
  }

  async deleteOffer(id: number, userId: number) {
    const offer = await CpRideOffers.findByPk(id);
    if (!offer) throw new NotFoundException('Ride offer not found');
    if ((offer as any).offeredBy !== userId) {
      throw new NotFoundException('Not authorized to delete this offer');
    }
    await offer.update({ status: 'deleted' } as any);
    return { id, deleted: true };
  }
}
