import { Module } from '@nestjs/common';
import { KpointController } from './kpoint.controller';
import { KpointService } from './kpoint.service';

/**
 * KPoint — Wave 2 module.
 *
 * Hero's kPoint video-learning portal. Provides dashboard tiles, a hierarchical
 * link tree, and video entries filterable by type / language.
 *
 * Tables: hero_kpoint_dashboard, hero_kpoint_links, hero_kpoint_videos,
 *         hero_kpoint_disclaimer
 */
@Module({
  controllers: [KpointController],
  providers: [KpointService],
  exports: [KpointService],
})
export class KpointModule {}
