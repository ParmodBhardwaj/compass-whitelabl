import { Module } from '@nestjs/common';
import { GuestHouseController } from './guest-house.controller';
import { GuestHouseService } from './guest-house.service';

/**
 * Guest House — Wave 3 module.
 * Employees book rooms at Hero guest houses.
 * Tables: hero_guest_house, hero_guest_booking
 */
@Module({
  controllers: [GuestHouseController],
  providers: [GuestHouseService],
  exports: [GuestHouseService],
})
export class GuestHouseModule {}
