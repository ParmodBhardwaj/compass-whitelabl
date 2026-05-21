import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ActivityDto, ActivityService } from './activity.service';

@Controller('activities')
export class ActivityController {
  constructor(private readonly svc: ActivityService) {}

  @Get()
  list(
    @Query('featured') featured?: string,
    @Query('q') q?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: '0' | '1',
  ) {
    return this.svc.list({
      featured: featured === '1' || featured === 'true',
      q,
      limit: limit ? Number(limit) : undefined,
      status: status ?? '1',
    });
  }

  @Get('by-alias/:alias')
  async byAlias(@Param('alias') alias: string) {
    const r = await this.svc.byAlias(alias);
    if (!r) throw new NotFoundException();
    return r;
  }

  @Get(':id')
  async byId(@Param('id') id: string) {
    const r = await this.svc.byId(Number(id));
    if (!r) throw new NotFoundException();
    return r;
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  create(@Body() body: ActivityDto) {
    return this.svc.create(body);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'))
  update(@Param('id') id: string, @Body() body: Partial<ActivityDto>) {
    return this.svc.update(Number(id), body);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  remove(@Param('id') id: string) {
    return this.svc.remove(Number(id));
  }
}
