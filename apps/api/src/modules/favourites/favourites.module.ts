import { Module } from '@nestjs/common';
import { FavouritesController } from './favourites.controller';
import { FavouritesService } from './favourites.service';
import { RecentViewController } from './recentview.controller';
import { RecentViewService } from './recentview.service';

/**
 * - hero_favourite ⇒ "Favorite" tab in the right-panel MY APPLICATIONS list.
 * - hero_recentview ⇒ "Recently Viewed" + "Most Viewed" tabs.
 */
@Module({
  controllers: [FavouritesController, RecentViewController],
  providers: [FavouritesService, RecentViewService],
  exports: [FavouritesService, RecentViewService],
})
export class FavouritesModule {}
