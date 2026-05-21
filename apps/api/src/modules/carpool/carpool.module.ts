import { Module } from '@nestjs/common';
import { CarpoolController } from './carpool.controller';
import { CarpoolService } from './carpool.service';

/**
 * Car Pool — Wave 3 module.
 * Employees post and find ride-share offers to/from office.
 * Tables: cp_ride_offers, cp_office_locations
 */
@Module({
  controllers: [CarpoolController],
  providers: [CarpoolService],
  exports: [CarpoolService],
})
export class CarpoolModule {}
