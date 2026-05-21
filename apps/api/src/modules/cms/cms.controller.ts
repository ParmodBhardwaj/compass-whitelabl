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
import { CmsService, CmsImageDto, CmsPageDto } from './cms.service';

@Controller('cms/pages')
export class CmsController {
  constructor(private readonly svc: CmsService) {}

  // ---- public reads ----
  @Get()
  list(@Query('store') store?: string, @Query('q') q?: string, @Query('status') status?: '0' | '1') {
    return this.svc.listPages({
      storeId: store ? Number(store) : undefined,
      q,
      status: status ?? '1',
    });
  }

  @Get('by-alias/:alias')
  async byAlias(@Param('alias') alias: string) {
    const r = await this.svc.pageByAlias(alias);
    if (!r) throw new NotFoundException();
    return r;
  }

  @Get(':id')
  async byId(@Param('id') id: string) {
    const r = await this.svc.pageById(Number(id));
    if (!r) throw new NotFoundException();
    return r;
  }

  // ---- admin CRUD (JWT-guarded) ----
  @Post()
  @UseGuards(AuthGuard('jwt'))
  create(@Body() body: CmsPageDto) {
    return this.svc.createPage(body);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'))
  update(@Param('id') id: string, @Body() body: CmsPageDto) {
    return this.svc.updatePage(Number(id), body);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  remove(@Param('id') id: string) {
    return this.svc.deletePage(Number(id));
  }

  @Post(':id/images')
  @UseGuards(AuthGuard('jwt'))
  addImages(@Param('id') id: string, @Body() body: { images: Array<Omit<CmsImageDto, 'pageId'>> }) {
    return this.svc.addImages(Number(id), body.images);
  }

  @Delete('images/:imageId')
  @UseGuards(AuthGuard('jwt'))
  deleteImage(@Param('imageId') imageId: string) {
    return this.svc.deleteImage(Number(imageId));
  }
}
