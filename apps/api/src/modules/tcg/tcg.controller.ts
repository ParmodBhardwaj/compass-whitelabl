import { Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TcgService } from './tcg.service';

@Controller('tcg')
@UseGuards(AuthGuard('jwt'))
export class TcgController {
  constructor(private readonly svc: TcgService) {}

  /** Dashboard payload — notice, joinees, competitor products, login count. */
  @Get('dashboard')
  dashboard(@Query('storeId') storeId?: string) {
    return this.svc.getDashboard(storeId ? +storeId : 6);
  }

  /** Track this user as having visited the TCG portal (deduped per day). */
  @Post('track-login')
  track(@Req() req: any) {
    return this.svc.trackLogin(req.user?.id, req.user?.email);
  }

  /** Aggregate login stats (admin). */
  @Get('login-stats')
  stats(@Query('from') from?: string, @Query('to') to?: string) {
    return this.svc.loginStats({ from, to });
  }

  /** Daily login trend (admin chart). */
  @Get('login-trend')
  trend(@Query('days') days?: string) {
    return this.svc.loginTrend(days ? +days : 30);
  }
}
