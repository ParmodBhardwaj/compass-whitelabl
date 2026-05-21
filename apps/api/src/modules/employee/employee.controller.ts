import { Controller, Get, NotFoundException, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { EmployeeService } from './employee.service';

@Controller('employees')
@UseGuards(AuthGuard('jwt'))
export class EmployeeController {
  constructor(private readonly svc: EmployeeService) {}

  @Get()
  list(
    @Query('departmentId') departmentId?: string,
    @Query('locationId') locationId?: string,
    @Query('grade') grade?: string,
    @Query('designation') designation?: string,
    @Query('q') q?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.svc.list({
      departmentId: departmentId ? Number(departmentId) : undefined,
      locationId: locationId ? Number(locationId) : undefined,
      grade,
      designation,
      q,
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined,
    });
  }

  @Get('departments')
  departments() {
    return this.svc.departments();
  }

  @Get('locations')
  locations() {
    return this.svc.locations();
  }

  @Get('birthdays')
  birthdays(@Query('days') days?: string) {
    return this.svc.upcomingBirthdays(days ? Number(days) : 14);
  }

  @Get('by-ecode/:ecode')
  async byEcode(@Param('ecode') ecode: string) {
    const e = await this.svc.findByEcode(ecode);
    if (!e) throw new NotFoundException();
    return e;
  }

  @Get(':id')
  async byId(@Param('id') id: string) {
    const e = await this.svc.findById(Number(id));
    if (!e) throw new NotFoundException();
    return e;
  }
}
