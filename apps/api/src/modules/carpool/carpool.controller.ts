import {
  Body, Controller, Delete, Get, Param, ParseIntPipe,
  Post, Put, Query, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CarpoolService, RideOfferDto } from './carpool.service';

@Controller('carpool')
@UseGuards(AuthGuard('jwt'))
export class CarpoolController {
  constructor(private readonly svc: CarpoolService) {}

  @Get('locations')
  getOfficeLocations() {
    return this.svc.getOfficeLocations();
  }

  @Get('offers')
  listOffers(
    @Query('offeredBy') offeredBy?: string,
    @Query('fromLocation') fromLocation?: string,
    @Query('toCity') toCity?: string,
    @Query('status') status?: string,
    @Query('all') all?: string,
  ) {
    return this.svc.listOffers({
      offeredBy: offeredBy ? +offeredBy : undefined,
      fromLocation: fromLocation ? +fromLocation : undefined,
      toCity: toCity ? +toCity : undefined,
      status,
      all: all === '1',
    });
  }

  @Get('offers/:id')
  getOffer(@Param('id', ParseIntPipe) id: number) {
    return this.svc.getOffer(id);
  }

  @Post('offers')
  createOffer(@Body() dto: RideOfferDto) {
    return this.svc.createOffer(dto);
  }

  @Put('offers/:id')
  updateOffer(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<RideOfferDto>,
  ) {
    return this.svc.updateOffer(id, dto);
  }

  @Delete('offers/:id')
  deleteOffer(
    @Param('id', ParseIntPipe) id: number,
    @Query('userId', ParseIntPipe) userId: number,
  ) {
    return this.svc.deleteOffer(id, userId);
  }
}
