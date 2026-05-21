import { Module } from '@nestjs/common';
import { IdeaController } from './idea.controller';
import { IdeaService } from './idea.service';

/**
 * Idea Portal — Wave 2 module.
 *
 * Time-bound idea campaigns where employees submit improvement ideas.
 * Admins create campaigns (idea_portal) with categories; employees submit
 * ideas individually or as a group. Submissions are visible to campaign admins.
 *
 * Tables: idea_portal, idea_portal_category, idea_submitted,
 *   idea_submitted_users, idea_admin_user, idea_banners, idea_banner_content
 */
@Module({
  controllers: [IdeaController],
  providers: [IdeaService],
  exports: [IdeaService],
})
export class IdeaModule {}
