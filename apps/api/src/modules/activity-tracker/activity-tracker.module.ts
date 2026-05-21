import { Module } from '@nestjs/common';
import { ActivityTrackerController } from './activity-tracker.controller';
import { ActivityTrackerService } from './activity-tracker.service';

/**
 * Activity Tracker — Wave 2 module.
 *
 * Tracks time-bound tasks assigned to employees, grouped into programs.
 * Supports ownership transfer, end-date revision requests, and email
 * escalation via BullMQ worker (workers/activity-tracker-escalation.ts).
 *
 * Tables used:
 *   activity_tracker_programs
 *   activity_tracker_tasks
 *   activity_tracker_task_user
 *   activity_tracker_email_escalation
 *   activity_tracker_revise_request
 *   activity_tracker_transfer_request
 *
 * Escalation mail schedule (driven by task end_date):
 *   - 30 days BEFORE end_date: reminder to task owner
 *   - ON end_date (if not completed): notify reporting manager
 *   - +7 days after end_date: second escalation
 *   - +15 days after end_date: third escalation
 */
@Module({
  controllers: [ActivityTrackerController],
  providers: [ActivityTrackerService],
  exports: [ActivityTrackerService],
})
export class ActivityTrackerModule {}
