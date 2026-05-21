import { Module } from '@nestjs/common';
import { InsuranceController } from './insurance.controller';
import { InsuranceService } from './insurance.service';

/**
 * Insurance Portal — Wave 3 module.
 *
 * Provides insurance documents, FAQs, and useful hyperlinks to employees.
 * Content managed by admins; read-only for employees.
 *
 * Tables: insurance_documents, insurance_faqs, insurance_hyperlinks
 */
@Module({
  controllers: [InsuranceController],
  providers: [InsuranceService],
  exports: [InsuranceService],
})
export class InsuranceModule {}
