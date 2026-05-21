import { Module } from '@nestjs/common';
import { MasterDataController } from './master-data.controller';
import { MasterDataService } from './master-data.service';

/**
 * Master-data admin module. Owns the small reference-data CRUD tables that
 * don't deserve a full module each: department, hero_location, hero_setting.
 */
@Module({
  controllers: [MasterDataController],
  providers: [MasterDataService],
  exports: [MasterDataService],
})
export class MasterDataModule {}
