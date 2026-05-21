import { Module } from '@nestjs/common';
import { TpmController } from './tpm.controller';
import { TpmService } from './tpm.service';

/**
 * TPM (Total Productive Maintenance) — Wave 2 module.
 *
 * Sub-modules:
 *   Hazard Redressal — Operators raise safety hazard cards.
 *     Flow: operator raises → line manager accepts/assigns → corrector
 *     fixes → line manager closes. Escalation at 3d / 1w / 4w if overdue.
 *
 *   OPL (One Point Lesson) — Operators submit knowledge cards (before/after
 *     photos + description). Approval flow: pillar lead → section head →
 *     plant head. Approved OPLs visible to all plant employees.
 *
 * Tables:
 *   hazard_request, hazard_timeline, hazard_category, hazard_sub_category,
 *   hazard_impact, hazard_audit_type, hazard_team_hierarchy
 *   opl_request, opl_request_action, opl_piller, opl_topic, opl_theme
 *   tpm_applications, tpm_master_plant, tpm_master_data,
 *   tpm_plant_applications, tpm_escalation,
 *   tpm_master_non_staff, tpm_operator_nonstaff
 */
@Module({
  controllers: [TpmController],
  providers: [TpmService],
  exports: [TpmService],
})
export class TpmModule {}
