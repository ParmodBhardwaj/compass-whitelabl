import { Module } from '@nestjs/common';
import { PortalDataController } from './portal-data.controller';
import { PortalDataService } from './portal-data.service';

/**
 * Per-portal admin master-data module — Car Pool, Sale/Rent, Idea Portal
 * content, R&D, D&I, Quality Alert, OEE masters, Audit Tracker.
 */
@Module({
  controllers: [PortalDataController],
  providers: [PortalDataService],
  exports: [PortalDataService],
})
export class PortalDataModule {}
