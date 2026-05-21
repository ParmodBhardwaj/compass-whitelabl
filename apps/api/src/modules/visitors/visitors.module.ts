import { Module } from '@nestjs/common';
import { VisitorsController } from './visitors.controller';
import { VisitorsService } from './visitors.service';

/**
 * Visitor Gate Pass — Wave 3 module.
 * Employees create visitor appointments; security approves and issues gate passes.
 * Tables: visitor_appointment, visitor_appointment_users, visitor_locations,
 *         visitor_pass, visitor_batches, visitor_batch_assigned
 */
@Module({
  controllers: [VisitorsController],
  providers: [VisitorsService],
  exports: [VisitorsService],
})
export class VisitorsModule {}
