import { Module } from '@nestjs/common';
import { OeeController } from './oee.controller';
import { OeeService } from './oee.service';

/**
 * OEE (Overall Equipment Effectiveness) — Wave 2 module.
 *
 * Floor operators log daily OEE data per shift / line / machine.
 * OEE = Availability × Performance × Quality
 *
 * Tables: oee_request, oee_department, oee_section, oee_line, oee_machine,
 *   oee_group, oee_group_user, oee_phenomena, oee_phenomena_value,
 *   oee_model, oee_model_value, oee_monthly_groupwise_data,
 *   oee_monthly_sectionwise_data, oee_yearly_section_wise_data,
 *   oee_holiday, oee_skip_line, oee_loss_category, oee_loss_section,
 *   oee_bottleneck, oee_business_excellence, oee_mfg_coordinator
 */
@Module({
  controllers: [OeeController],
  providers: [OeeService],
  exports: [OeeService],
})
export class OeeModule {}
