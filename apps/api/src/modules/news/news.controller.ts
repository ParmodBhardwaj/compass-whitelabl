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
import { NewsDto, NewsService } from './news.service';

@Controller('news')
export class NewsController {
  constructor(private readonly svc: NewsService) {}

  @Get()
  list(
    @Query('store') store = '1',
    @Query('type') type?: '0' | '1',
    @Query('featured') featured?: string,
    @Query('limit') limit?: string,
    @Query('q') q?: string,
    @Query('status') status?: '0' | '1',
  ) {
    return this.svc.list({
      storeId: Number(store),
      type,
      featured: featured === '1' || featured === 'true',
      limit: limit ? Number(limit) : undefined,
      q,
      status: status ?? '1',
    });
  }

  @Get('by-alias/:alias')
  async byAlias(@Param('alias') alias: string) {
    const item = await this.svc.byAlias(alias);
    if (!item) throw new NotFoundException();
    return item;
  }

  @Get(':id')
  async byId(@Param('id') id: string) {
    const item = await this.svc.byId(Number(id));
    if (!item) throw new NotFoundException();
    return item;
  }

  // ---- admin ----
  @Post()
  @UseGuards(AuthGuard('jwt'))
  create(@Body() body: NewsDto) {
    return this.svc.create(body);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'))
  update(@Param('id') id: string, @Body() body: Partial<NewsDto>) {
    return this.svc.update(Number(id), body);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  remove(@Param('id') id: string) {
    return this.svc.remove(Number(id));
  }
}
