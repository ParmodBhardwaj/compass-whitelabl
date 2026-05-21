import { Module } from '@nestjs/common';
import { DniController } from './dni.controller';
import { DniService } from './dni.service';

/**
 * D&I (Diversity & Inclusion) Portal — Wave 3 module.
 *
 * Hero's Diversity & Inclusion information portal. Showcases D&I events,
 * initiatives, featured stories, newsletters, and videos.
 *
 * Tables: hero_di_events, hero_di_events_category, hero_di_featured,
 *         hero_di_initiative, hero_di_newsletter, hero_di_video
 */
@Module({
  controllers: [DniController],
  providers: [DniService],
  exports: [DniService],
})
export class DniModule {}
