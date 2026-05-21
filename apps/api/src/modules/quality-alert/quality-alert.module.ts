import { Module } from '@nestjs/common';
import { QualityAlertController } from './quality-alert.controller';
import { QualityAlertService } from './quality-alert.service';

/**
 * Quality Alert — Wave 2 module.
 *
 * Production quality alert tracking system. Initiators raise quality alerts
 * citing reason, line, shift, frame number. Quality persons resolve them.
 * Full timeline tracking with attachments.
 *
 * Tables: qa_request, qa_request_attachments, qa_timeline,
 *         qa_initiator, qa_subdepartment, qa_task_user
 */
@Module({
  controllers: [QualityAlertController],
  providers: [QualityAlertService],
  exports: [QualityAlertService],
})
export class QualityAlertModule {}
