import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { BannerDto, BannerService, HomeBannerDto } from './banner.service';

@Controller('banners')
export class BannerController {
  constructor(private readonly svc: BannerService) {}

  // ---- home banners (main portal carousel) ----
  @Get('home')
  home() {
    return this.svc.homeBanners();
  }

  @Post('home')
  @UseGuards(AuthGuard('jwt'))
  createHome(@Body() body: HomeBannerDto) {
    return this.svc.createHome(body);
  }

  @Put('home/:id')
  @UseGuards(AuthGuard('jwt'))
  updateHome(@Param('id') id: string, @Body() body: HomeBannerDto) {
    return this.svc.updateHome(Number(id), body);
  }

  @Delete('home/:id')
  @UseGuards(AuthGuard('jwt'))
  deleteHome(@Param('id') id: string) {
    return this.svc.deleteHome(Number(id));
  }

  // ---- per-store banners ----
  @Get()
  byStore(@Query('store') store: string, @Query('active') active?: string) {
    return this.svc.listByStore(Number(store), active === '1' || active === 'true');
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  create(@Body() body: BannerDto) {
    return this.svc.create(body);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'))
  update(@Param('id') id: string, @Body() body: BannerDto) {
    return this.svc.update(Number(id), body);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  remove(@Param('id') id: string) {
    return this.svc.remove(Number(id));
  }
}
