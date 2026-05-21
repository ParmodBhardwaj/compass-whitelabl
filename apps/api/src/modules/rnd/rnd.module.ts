import { Module } from '@nestjs/common';
import { RndController } from './rnd.controller';
import { RndService } from './rnd.service';

/**
 * R&D Portal — Wave 3 module.
 *
 * Research & Development information portal for Hero employees.
 * Provides notice board announcements, new-joinees showcase, and
 * competitor product comparison data.
 *
 * Tables: hero_rnd_notice_board, hero_rnd_joinees, hero_rnd_competitor_product
 */
@Module({
  controllers: [RndController],
  providers: [RndService],
  exports: [RndService],
})
export class RndModule {}
