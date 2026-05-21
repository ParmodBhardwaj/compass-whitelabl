import { Module } from '@nestjs/common';
import { AuditController } from './audit.controller';
import { AuditService } from './audit.service';
import { AuditEscalationService } from './escalation.service';

/**
 * Audit Follow-Up Tool — formerly excel-driven, now app-driven.
 *
 * Tables: audit, audit_section, audit_revise, audit_timeline, audit_timeline_attachment,
 *   audit_timeline_revised, audit_log, audit_section_log, audit_section_attachment,
 *   audit_section_applicability(_values), audit_section_observation_category(_value),
 *   audit_section_processowner, audit_email_notification, audit_internal_team,
 *   audit_team, audit_team_user, audit_team_hierarchy_27, audit_theme, audit_category,
 *   audit_cutoff_date, audit_cutoff_date_observation.
 *
 * Approval flow per observation (audit_section):
 *   IA enters observation → process owner uploads evidence → reporting manager
 *   approves/resubmit → function head approves/resubmit → IA verifies → close.
 *
 * Email escalation matrix (cron):
 *   - 30 days BEFORE cut-off: notify process owner, RO + IA in cc/loop
 *   - ON cut-off date if no action: escalate to RO (+ function head + IA in loop)
 *   - +7 days from cut-off: function head (+ RO, process owner, dept head, IA)
 *   - +15 days from cut-off: department head (+ RO, process owner, function head, IA)
 *
 * Escalation queries `audit_section.timeline` (or `revised`) and writes to
 * `audit_email_notification`. The actual cron runs in workers/ — this module
 * exposes the read API + state-transition endpoints.
 */
@Module({
  controllers: [AuditController],
  providers: [AuditService, AuditEscalationService],
  exports: [AuditService, AuditEscalationService],
})
export class AuditModule {}
