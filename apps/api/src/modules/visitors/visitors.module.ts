import { Module } from '@nestjs/common';
import { VisitorsController } from './visitors.controller';
import { VisitorsService } from './visitors.service';
import { VisitorsAdminController } from './visitors-admin.controller';
import { VisitorsAdminService } from './visitors-admin.service';

/**
 * Visitor Gate Pass — Wave 3 module.
 * Employees create visitor appointments; security approves and issues gate passes.
 *
 * Two controllers:
 *   • VisitorsController       — user-facing flows (appointments, gate pass, …)
 *   • VisitorsAdminController  — /v2/visitors/admin/* CRUD backing the 12
 *                                admin pages (locations, instructions, …)
 *
 * Tables: visitor_appointment, visitor_appointment_users, visitor_locations,
 *         visitor_pass, visitor_batches, visitor_batch_assigned,
 *         visitor_instructions, visitor_approval_members, visitor_disabled_fields,
 *         visitor_security_members, visitor_canteen_member, visitor_reception_member,
 *         visitor_feedback_location_dept, visitor_feedback_questions,
 *         visitor_location_wise_grades
 */
@Module({
  controllers: [VisitorsController, VisitorsAdminController],
  providers: [VisitorsService, VisitorsAdminService],
  exports: [VisitorsService],
})
export class VisitorsModule {}
