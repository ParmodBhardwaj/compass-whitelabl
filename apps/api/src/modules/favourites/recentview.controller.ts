import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RecentViewService } from './recentview.service';

@Controller('recent-views')
@UseGuards(AuthGuard('jwt'))
export class RecentViewController {
  constructor(private readonly svc: RecentViewService) {}

  /** Called from the web app whenever a user opens a portal/app. */
  @Post('track')
  track(@Req() req: any, @Body() body: { menuId: number; url: string }) {
    return this.svc.track(req.user.id, body.menuId, body.url);
  }

  @Get('recent')
  recent(@Req() req: any, @Query('limit') limit?: string) {
    return this.svc.recent(req.user.id, limit ? Number(limit) : undefined);
  }

  @Get('most-viewed')
  most(@Req() req: any, @Query('limit') limit?: string) {
    return this.svc.mostViewed(req.user.id, limit ? Number(limit) : undefined);
  }
}
