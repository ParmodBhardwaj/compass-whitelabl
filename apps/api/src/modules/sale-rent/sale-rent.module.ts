import { Module } from '@nestjs/common';
import { SaleRentController } from './sale-rent.controller';
import { SaleRentService } from './sale-rent.service';

/**
 * Sale & Rent — Wave 3 module.
 * Employees post and browse sale/rental listings within the organization.
 * Tables: sale, hero_sale_category, hero_sale_selected_category
 */
@Module({
  controllers: [SaleRentController],
  providers: [SaleRentService],
  exports: [SaleRentService],
})
export class SaleRentModule {}
