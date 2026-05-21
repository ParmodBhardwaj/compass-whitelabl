import {
  Body, Controller, Delete, Get, Param, ParseIntPipe,
  Post, Put, Query, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SaleRentService, SaleDto } from './sale-rent.service';

@Controller('sale-rent')
@UseGuards(AuthGuard('jwt'))
export class SaleRentController {
  constructor(private readonly svc: SaleRentService) {}

  @Get('categories')
  getCategories() {
    return this.svc.getCategories();
  }

  @Get('listings')
  listListings(
    @Query('userId') userId?: string,
    @Query('categoryId') categoryId?: string,
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('all') all?: string,
  ) {
    return this.svc.listListings({
      userId: userId ? +userId : undefined,
      categoryId: categoryId ? +categoryId : undefined,
      type,
      status,
      search,
      all: all === '1',
    });
  }

  @Get('stats')
  stats(@Query('userId') userId?: string) {
    return this.svc.stats(userId ? +userId : undefined);
  }

  @Get('listings/:id')
  getListing(@Param('id', ParseIntPipe) id: number) {
    return this.svc.getListing(id);
  }

  @Post('listings')
  createListing(@Body() dto: SaleDto) {
    return this.svc.createListing(dto);
  }

  @Put('listings/:id')
  updateListing(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { userId: number } & Partial<SaleDto>,
  ) {
    const { userId, ...dto } = body;
    return this.svc.updateListing(id, userId, dto);
  }

  @Delete('listings/:id')
  deleteListing(
    @Param('id', ParseIntPipe) id: number,
    @Query('userId', ParseIntPipe) userId: number,
  ) {
    return this.svc.deleteListing(id, userId);
  }

  @Put('listings/:id/sold')
  markSold(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { userId: number },
  ) {
    return this.svc.markSold(id, body.userId);
  }
}
