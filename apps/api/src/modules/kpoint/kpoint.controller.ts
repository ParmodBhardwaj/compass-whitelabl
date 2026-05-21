import {
  Body, Controller, Delete, Get, Param, ParseIntPipe,
  Post, Put, Query, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { KpointService } from './kpoint.service';

@Controller('kpoint')
@UseGuards(AuthGuard('jwt'))
export class KpointController {
  constructor(private readonly svc: KpointService) {}

  // ── Dashboard ─────────────────────────────────────────────────────────────

  @Get('dashboard')
  getDashboard() {
    return this.svc.getDashboard();
  }

  @Post('dashboard')
  createDashboardItem(@Body() body: {
    title: string;
    image?: string;
    imageLink?: string;
    videoType?: string;
    dealerVisible?: string;
    status?: string;
  }) {
    return this.svc.createDashboardItem(body);
  }

  @Put('dashboard/:id')
  updateDashboardItem(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
  ) {
    return this.svc.updateDashboardItem(id, body);
  }

  @Delete('dashboard/:id')
  deleteDashboardItem(@Param('id', ParseIntPipe) id: number) {
    return this.svc.deleteDashboardItem(id);
  }

  // ── Links ────────────────────────────────────────────────────────────────

  /** Full hierarchical tree of active links */
  @Get('links/tree')
  getLinkTree() {
    return this.svc.getLinkTree();
  }

  /** Flat list, optionally filtered by parentId */
  @Get('links')
  getLinks(@Query('parentId') parentId?: string) {
    return this.svc.getLinks(parentId ? +parentId : undefined);
  }

  @Post('links')
  createLink(@Body() body: any) {
    return this.svc.createLink(body);
  }

  @Put('links/:id')
  updateLink(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.svc.updateLink(id, body);
  }

  @Delete('links/:id')
  deleteLink(@Param('id', ParseIntPipe) id: number) {
    return this.svc.deleteLink(id);
  }

  // ── Videos ───────────────────────────────────────────────────────────────

  @Get('videos')
  getVideos(
    @Query('type') type?: string,
    @Query('language') language?: string,
    @Query('videoLinkId') videoLinkId?: string,
  ) {
    return this.svc.getVideos({
      type,
      language,
      videoLinkId: videoLinkId ? +videoLinkId : undefined,
    });
  }

  @Get('videos/:id')
  getVideo(@Param('id', ParseIntPipe) id: number) {
    return this.svc.getVideo(id);
  }

  @Post('videos')
  createVideo(@Body() body: any) {
    return this.svc.createVideo(body);
  }

  @Put('videos/:id')
  updateVideo(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.svc.updateVideo(id, body);
  }

  @Delete('videos/:id')
  deleteVideo(@Param('id', ParseIntPipe) id: number) {
    return this.svc.deleteVideo(id);
  }

  // ── Disclaimer ───────────────────────────────────────────────────────────

  @Get('disclaimer')
  getDisclaimer() {
    return this.svc.getDisclaimer();
  }
}
