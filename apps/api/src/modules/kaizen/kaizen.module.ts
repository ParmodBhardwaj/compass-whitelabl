import { Module } from '@nestjs/common';
import { KaizenController } from './kaizen.controller';
import { KaizenService } from './kaizen.service';

/**
 * Kaizen (Continuous Improvement) — Wave 2 module.
 *
 * Employees submit improvement ideas with before/after photos,
 * problem definition, counter-measures, and savings estimates.
 *
 * Approval flow:
 *   initiator submits → section head reviews → pillar head approves
 *   → plant head final approval. At each step: approve / reject / revision.
 *
 * Tables:
 *   kaizen_request         — main kaizen card
 *   kaizen_timeline        — approval actions history
 *   kaizen_pillar          — pillars (AM, PM, FI, QM, SHE, etc.)
 *   kaizen_section         — shop-floor sections per location
 *   kaizen_loss            — loss category reference
 *   kaizen_machine         — machine reference
 *   kaizen_miscellaneous   — misc reference data
 *   kaizen_plant           — plant reference
 *   kaizen_team_hierarchy  — approval hierarchy per pillar
 *   kaizen_idea_user       — users linked to an idea (team kaizen)
 *   kaizen_initiator       — initiator details
 */
@Module({
  controllers: [KaizenController],
  providers: [KaizenService],
  exports: [KaizenService],
})
export class KaizenModule {}
