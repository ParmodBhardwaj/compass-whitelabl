import {
  Body, Controller, Get, Param, ParseIntPipe,
  Post, Put, Query, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GuestHouseService, GuestBookingDto } from './guest-house.service';

@Controller('guest-house')
@UseGuards(AuthGuard('jwt'))
export class GuestHouseController {
  constructor(private readonly svc: GuestHouseService) {}

  @Get('houses')
  listHouses(@Query('locationId') locationId?: string) {
    return this.svc.listHouses(locationId ? +locationId : undefined);
  }

  @Get('houses/:id')
  getHouse(@Param('id', ParseIntPipe) id: number) {
    return this.svc.getHouse(id);
  }

  @Get('bookings')
  listBookings(
    @Query('empId') empId?: string,
    @Query('guestHouseId') guestHouseId?: string,
    @Query('status') status?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('all') all?: string,
  ) {
    return this.svc.listBookings({
      empId: empId ? +empId : undefined,
      guestHouseId,
      status,
      from,
      to,
      all: all === '1',
    });
  }

  @Get('stats')
  stats(@Query('empId') empId?: string) {
    return this.svc.stats(empId ? +empId : undefined);
  }

  @Get('bookings/:id')
  getBooking(@Param('id', ParseIntPipe) id: number) {
    return this.svc.getBooking(id);
  }

  @Post('bookings')
  createBooking(@Body() dto: GuestBookingDto) {
    return this.svc.createBooking(dto);
  }

  @Put('bookings/:id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { status: string; statusReason?: string },
  ) {
    return this.svc.updateBookingStatus(id, body.status, body.statusReason);
  }

  @Put('bookings/:id/cancel')
  cancelBooking(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { empId: number; reason?: string },
  ) {
    return this.svc.cancelBooking(id, body.empId, body.reason);
  }
}
