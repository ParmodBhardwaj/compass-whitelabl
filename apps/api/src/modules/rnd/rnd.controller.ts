import {
  Body, Controller, Delete, Get, Param, ParseIntPipe,
  Post, Put, Query, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RndService } from './rnd.service';

@Controller('rnd')
@UseGuards(AuthGuard('jwt'))
export class RndController {
  constructor(private readonly svc: RndService) {}

  // ── Dashboard ────────────────────────────────────────────────────────────

  /** One-shot landing payload — notice + joinees + competitor + ceo msg + news + birthdays. */
  @Get('dashboard')
  dashboard(@Query('storeId') storeId?: string) {
    return this.svc.getDashboard(storeId ? +storeId : 6);
  }

  @Get('birthdays')
  birthdays(@Query('days') days?: string) {
    return this.svc.recentBirthdays(days ? +days : 7);
  }

  // ── CEO Message & Overview ───────────────────────────────────────────────

  @Get('ceo-message')
  getCeoMessage() {
    return this.svc.getCeoMessage();
  }

  @Get('overview')
  getOverview() {
    return this.svc.getOverview();
  }

  @Put('ceo-message')
  updateCeoMessage(@Body() body: Partial<{ title: string; description: string; image: string }>) {
    return this.svc.updateCeoMessage(body);
  }

  @Put('overview')
  updateOverview(@Body() body: Partial<{ title: string; description: string; image: string }>) {
    return this.svc.updateOverview(body);
  }

  // ── Notice Board ─────────────────────────────────────────────────────────

  @Get('notices')
  getNotices() {
    return this.svc.getNotices();
  }

  @Post('notices')
  createNotice(@Body() body: { description: string; status?: string }) {
    return this.svc.createNotice(body);
  }

  @Put('notices/:id')
  updateNotice(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: Partial<{ description: string; status: string }>,
  ) {
    return this.svc.updateNotice(id, body);
  }

  @Delete('notices/:id')
  deleteNotice(@Param('id', ParseIntPipe) id: number) {
    return this.svc.deleteNotice(id);
  }

  // ── Joinees ──────────────────────────────────────────────────────────────

  @Get('joinees')
  getJoinees(@Query('storeId') storeId?: string) {
    return this.svc.getJoinees(storeId ? +storeId : 1);
  }

  @Post('joinees')
  createJoinee(@Body() body: any) {
    return this.svc.createJoinee(body);
  }

  @Put('joinees/:id')
  updateJoinee(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.svc.updateJoinee(id, body);
  }

  @Delete('joinees/:id')
  deleteJoinee(@Param('id', ParseIntPipe) id: number) {
    return this.svc.deleteJoinee(id);
  }

  // ── Competitor Products ───────────────────────────────────────────────────

  @Get('competitor-products')
  getCompetitorProducts() {
    return this.svc.getCompetitorProducts();
  }

  @Post('competitor-products')
  createCompetitorProduct(@Body() body: any) {
    return this.svc.createCompetitorProduct(body);
  }

  @Put('competitor-products/:id')
  updateCompetitorProduct(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.svc.updateCompetitorProduct(id, body);
  }

  @Delete('competitor-products/:id')
  deleteCompetitorProduct(@Param('id', ParseIntPipe) id: number) {
    return this.svc.deleteCompetitorProduct(id);
  }
}
