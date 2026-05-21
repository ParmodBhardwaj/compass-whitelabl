import { Injectable, NotFoundException } from '@nestjs/common';
import { Op } from '@hero/db';
import {
  HeroGuestHouse,
  HeroGuestBooking,
} from '@hero/db/src/models/generated';

export interface GuestBookingDto {
  empId: number;
  guestHouseId: string;
  departureDate: string;
  departureTime: string;
  arrivalDate: string;
  arrivalTime: string;
  purpose: string;
  others?: string;
  mobile: string;
  occupancy?: string;
}

/**
 * Guest House — Wave 3 module.
 *
 * Employees book rooms at Hero guest houses. Admin manages house inventory;
 * bookings are approved/rejected by guest house owners.
 *
 * Tables: hero_guest_house, hero_guest_booking
 */
@Injectable()
export class GuestHouseService {
  // ── Guest houses ─────────────────────────────────────────────────────────────

  async listHouses(locationId?: number) {
    const where: any = { status: '1' };
    if (locationId) where.locationId = locationId;
    return HeroGuestHouse.findAll({ where, order: [['name', 'ASC']] });
  }

  async getHouse(id: number) {
    const house = await HeroGuestHouse.findByPk(id);
    if (!house) throw new NotFoundException('Guest house not found');
    return house;
  }

  // ── Bookings ─────────────────────────────────────────────────────────────────

  async listBookings(opts: {
    empId?: number;
    guestHouseId?: string;
    status?: string;
    from?: string;
    to?: string;
    all?: boolean;
  } = {}) {
    const where: any = {};
    if (opts.guestHouseId) where.guestHouseId = opts.guestHouseId;
    if (opts.status) where.status = opts.status;
    if (opts.from && opts.to) {
      where.departureDate = { [Op.between]: [opts.from, opts.to] };
    } else if (opts.from) {
      where.departureDate = { [Op.gte]: opts.from };
    }
    if (!opts.all && opts.empId) where.empId = opts.empId;
    return HeroGuestBooking.findAll({
      where,
      order: [['creationDate', 'DESC']],
    });
  }

  async getBooking(id: number) {
    const booking = await HeroGuestBooking.findByPk(id);
    if (!booking) throw new NotFoundException('Booking not found');
    return booking;
  }

  async createBooking(dto: GuestBookingDto) {
    // hero_guest_booking schema:
    //   others NOT NULL (text)    → default to '' instead of null
    //   status enum('0','1','2','3') NOT NULL → 0 = Pending (NOT 'pending')
    return HeroGuestBooking.create({
      empId: dto.empId,
      guestHouseId: dto.guestHouseId,
      departureDate: dto.departureDate,
      departureTime: dto.departureTime,
      arrivalDate: dto.arrivalDate,
      arrivalTime: dto.arrivalTime,
      purpose: dto.purpose,
      others: dto.others ?? '',
      mobile: dto.mobile,
      occupancy: dto.occupancy ?? 'single',
      status: '0',
      creationDate: new Date(),
    } as any);
  }

  async updateBookingStatus(id: number, status: string, statusReason?: string) {
    const booking = await HeroGuestBooking.findByPk(id);
    if (!booking) throw new NotFoundException('Booking not found');
    await booking.update({ status, statusReason: statusReason ?? null } as any);
    return booking;
  }

  async cancelBooking(id: number, empId: number, reason?: string) {
    const booking = await HeroGuestBooking.findByPk(id);
    if (!booking) throw new NotFoundException('Booking not found');
    if ((booking as any).empId !== empId) {
      throw new NotFoundException('Not authorized to cancel this booking');
    }
    await booking.update({ status: 'cancelled', statusReason: reason ?? null } as any);
    return { id, cancelled: true };
  }

  async stats(empId?: number) {
    const base: any = {};
    if (empId) base.empId = empId;
    const [total, pending, approved, rejected] = await Promise.all([
      HeroGuestBooking.count({ where: base }),
      HeroGuestBooking.count({ where: { ...base, status: 'pending' } }),
      HeroGuestBooking.count({ where: { ...base, status: 'approved' } }),
      HeroGuestBooking.count({ where: { ...base, status: 'rejected' } }),
    ]);
    return { total, pending, approved, rejected };
  }
}
