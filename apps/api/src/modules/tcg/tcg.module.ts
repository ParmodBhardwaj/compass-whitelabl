import { Module } from '@nestjs/common';
import { TcgController } from './tcg.controller';
import { TcgService } from './tcg.service';
import { RndModule } from '../rnd/rnd.module';

/**
 * TCG (Talent & Capability Grid) Portal — Wave 3 module.
 *
 * Mirrors legacy `module/Tcg/`. Reuses R&D tables for content (notices,
 * joinees, competitor products) and adds its own login-usage analytics.
 *
 * Tables: hero_tcg_login_usage, hero_rnd_notice_board, hero_rnd_joinees,
 *         hero_rnd_competitor_product
 */
@Module({
  imports: [RndModule],
  controllers: [TcgController],
  providers: [TcgService],
  exports: [TcgService],
})
export class TcgModule {}
