import { Module } from '@nestjs/common';
import { ActivityController } from './activity.controller';
import { ActivityService } from './activity.service';

/**
 * "Recent Activity" content cards shown on Main Portal / IS Portal home pages.
 * Maps to legacy `activity` table.
 *
 * Note: NOT the same as the Activity Tracker (task management) which lives in
 * apps/api/src/modules/activity-tracker/.
 */
@Module({
  controllers: [ActivityController],
  providers: [ActivityService],
  exports: [ActivityService],
})
export class ActivityModule {}
