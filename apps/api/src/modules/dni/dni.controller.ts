import {
  Body, Controller, Delete, Get, Param, ParseIntPipe,
  Post, Put, Query, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DniService } from './dni.service';

@Controller('dni')
@UseGuards(AuthGuard('jwt'))
export class DniController {
  constructor(private readonly svc: DniService) {}

  // ── Dashboard ─────────────────────────────────────────────────────────────

  /** One-shot landing payload — initiatives + featured + events + newsletters + videos. */
  @Get('dashboard')
  dashboard(@Query('storeId') storeId?: string) {
    return this.svc.getDashboard(storeId ? +storeId : 1);
  }

  // ── Events ────────────────────────────────────────────────────────────────

  @Get('events')
  listEvents(
    @Query('storeId') storeId?: string,
    @Query('categoryId') categoryId?: string,
    @Query('status') status?: string,
  ) {
    return this.svc.listEvents({
      storeId: storeId ? +storeId : 1,
      categoryId: categoryId ? +categoryId : undefined,
      status,
    });
  }

  @Get('events/categories')
  eventCategories() {
    return this.svc.eventCategories();
  }

  /** SEO-friendly detail-by-alias route (matches legacy `/dni-event/:alias`). */
  @Get('events/by-alias/:alias')
  getEventByAlias(@Param('alias') alias: string) {
    return this.svc.getEventByAlias(alias);
  }

  @Get('events/:id')
  getEvent(@Param('id', ParseIntPipe) id: number) {
    return this.svc.getEvent(id);
  }

  @Post('events')
  createEvent(@Body() body: any) {
    return this.svc.createEvent(body);
  }

  @Put('events/:id')
  updateEvent(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.svc.updateEvent(id, body);
  }

  @Delete('events/:id')
  deleteEvent(@Param('id', ParseIntPipe) id: number) {
    return this.svc.deleteEvent(id);
  }

  // ── Initiatives ───────────────────────────────────────────────────────────

  @Get('initiatives')
  listInitiatives(@Query('storeId') storeId?: string) {
    return this.svc.listInitiatives(storeId ? +storeId : 1);
  }

  @Get('initiatives/by-alias/:alias')
  getInitiativeByAlias(@Param('alias') alias: string) {
    return this.svc.getInitiativeByAlias(alias);
  }

  @Post('initiatives')
  createInitiative(@Body() body: any) {
    return this.svc.createInitiative(body);
  }

  @Put('initiatives/:id')
  updateInitiative(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.svc.updateInitiative(id, body);
  }

  @Delete('initiatives/:id')
  deleteInitiative(@Param('id', ParseIntPipe) id: number) {
    return this.svc.deleteInitiative(id);
  }

  // ── Featured ──────────────────────────────────────────────────────────────

  @Get('featured')
  listFeatured(@Query('storeId') storeId?: string) {
    return this.svc.listFeatured(storeId ? +storeId : 1);
  }

  @Get('featured/by-alias/:alias')
  getFeaturedByAlias(@Param('alias') alias: string) {
    return this.svc.getFeaturedByAlias(alias);
  }

  @Post('featured')
  createFeatured(@Body() body: any) {
    return this.svc.createFeatured(body);
  }

  @Put('featured/:id')
  updateFeatured(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.svc.updateFeatured(id, body);
  }

  @Delete('featured/:id')
  deleteFeatured(@Param('id', ParseIntPipe) id: number) {
    return this.svc.deleteFeatured(id);
  }

  // ── Newsletters ───────────────────────────────────────────────────────────

  @Get('newsletters')
  listNewsletters(@Query('storeId') storeId?: string) {
    return this.svc.listNewsletters(storeId ? +storeId : 1);
  }

  @Get('newsletters/by-alias/:alias')
  getNewsletterByAlias(@Param('alias') alias: string) {
    return this.svc.getNewsletterByAlias(alias);
  }

  @Post('newsletters')
  createNewsletter(@Body() body: any) {
    return this.svc.createNewsletter(body);
  }

  @Put('newsletters/:id')
  updateNewsletter(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.svc.updateNewsletter(id, body);
  }

  @Delete('newsletters/:id')
  deleteNewsletter(@Param('id', ParseIntPipe) id: number) {
    return this.svc.deleteNewsletter(id);
  }

  // ── Videos ───────────────────────────────────────────────────────────────

  @Get('videos')
  listVideos(@Query('storeId') storeId?: string) {
    return this.svc.listVideos(storeId ? +storeId : 1);
  }

  @Get('videos/by-alias/:alias')
  getVideoByAlias(@Param('alias') alias: string) {
    return this.svc.getVideoByAlias(alias);
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
}
