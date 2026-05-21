import { Module } from '@nestjs/common';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';

/**
 * Top-bar global search across CMS pages, news, gallery titles, menu apps,
 * and (optionally) employees. Mirrors the legacy Search module behavior.
 */
@Module({
  controllers: [SearchController],
  providers: [SearchService],
})
export class SearchModule {}
