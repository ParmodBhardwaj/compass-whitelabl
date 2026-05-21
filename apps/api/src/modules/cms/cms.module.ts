import { Module } from '@nestjs/common';
import { CmsController } from './cms.controller';
import { CmsService } from './cms.service';
import { BannerController } from './banner.controller';
import { BannerService } from './banner.service';

/** Maps to legacy hero_cms_pages, hero_cms_images, hero_banners, home_banners. */
@Module({
  controllers: [CmsController, BannerController],
  providers: [CmsService, BannerService],
  exports: [CmsService, BannerService],
})
export class CmsModule {}
