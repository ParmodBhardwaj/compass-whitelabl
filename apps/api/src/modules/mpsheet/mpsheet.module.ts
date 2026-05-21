import { Module } from '@nestjs/common';
import { MpsheetController } from './mpsheet.controller';
import { MpsheetService } from './mpsheet.service';

/**
 * MPSheet (Maintenance Prevention Sheet) — Wave 2 module.
 *
 * Employees raise MP requests for equipment / non-equipment incidents.
 * Approvers configured per plant and type. Timeline tracks all actions.
 *
 * Tables: mp_request, mp_timeline, mp_approver, mp_classification
 */
@Module({
  controllers: [MpsheetController],
  providers: [MpsheetService],
  exports: [MpsheetService],
})
export class MpsheetModule {}
