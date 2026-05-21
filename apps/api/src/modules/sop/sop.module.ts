import { Module } from '@nestjs/common';
import { SopController } from './sop.controller';
import { SopService } from './sop.service';
import { SopFeedbackController } from './feedback.controller';
import { SopFeedbackService } from './feedback.service';

/**
 * Standard Operating Procedures.
 *
 * Tables:
 *   sop_sections, sop_process, sop_procedures
 *   sop_level1, sop_level4_files, sop_feedback
 *   sop_admin_user, sop_roles, sop_activity_tracker
 *
 * 4-level structure (per Hero Sumerize Doc):
 *   Level 1 — admin-only PDF, single, editable not deletable
 *   Level 2 — view-only PDF, not downloadable
 *   Level 3 — view-only PDF in pop-up
 *   Level 4 — multiple files, downloadable
 *
 * Approval chain (sop_process.status enum):
 *   Raised → Stakeholder Approved → Section Head Approved → HOD Approved
 *          → GP Member Approved → GP Head Approved → SS&SC Head Approved
 *   (or *Rejected at any step). Mail triggered on every transition.
 *
 * Activity tracking: 6 user actions logged in sop_activity_tracker
 *   (view undertaking page / listing / level-1 / level-2 / level-3 / download level-4).
 */
@Module({
  controllers: [SopController, SopFeedbackController],
  providers: [SopService, SopFeedbackService],
  exports: [SopService],
})
export class SopModule {}
