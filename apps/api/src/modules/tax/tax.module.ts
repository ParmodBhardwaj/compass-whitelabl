import { Module } from '@nestjs/common';
import { TaxController } from './tax.controller';
import { TaxService } from './tax.service';

/**
 * Tax Insight — Wave 3 module.
 * Employees browse tax documents, FAQs, and hyperlinks.
 * Tables: tax_documents, tax_faqs, tax_hyperlinks
 */
@Module({
  controllers: [TaxController],
  providers: [TaxService],
  exports: [TaxService],
})
export class TaxModule {}
