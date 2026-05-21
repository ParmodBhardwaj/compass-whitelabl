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
import {
  GalleryCategoryDto,
  GalleryDto,
  GalleryImageDto,
  GalleryService,
} from './gallery.service';

@Controller('galleries')
export class GalleryController {
  constructor(private readonly svc: GalleryService) {}

  // ---- categories ----
  @Get('categories')
  categories() {
    return this.svc.categories();
  }

  @Post('categories')
  @UseGuards(AuthGuard('jwt'))
  createCategory(@Body() body: GalleryCategoryDto) {
    return this.svc.createCategory(body);
  }

  @Put('categories/:id')
  @UseGuards(AuthGuard('jwt'))
  updateCategory(@Param('id') id: string, @Body() body: Partial<GalleryCategoryDto>) {
    return this.svc.updateCategory(Number(id), body);
  }

  @Delete('categories/:id')
  @UseGuards(AuthGuard('jwt'))
  deleteCategory(@Param('id') id: string) {
    return this.svc.deleteCategory(Number(id));
  }

  // ---- galleries ----
  @Get()
  list(
    @Query('store') store = '1',
    @Query('category') category?: string,
    @Query('includeEmpty') includeEmpty?: string,
    @Query('covers') covers?: string,
  ) {
    return this.svc.list({
      storeId: Number(store),
      categoryId: category ? Number(category) : undefined,
      includeEmpty: includeEmpty === '1' || includeEmpty === 'true',
      withCover: covers === '1' || covers === 'true',
    });
  }

  @Get('admin')
  @UseGuards(AuthGuard('jwt'))
  admin() {
    return this.svc.listAdmin();
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
  create(@Body() body: GalleryDto) {
    return this.svc.create(body);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'))
  update(@Param('id') id: string, @Body() body: Partial<GalleryDto>) {
    return this.svc.update(Number(id), body);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  remove(@Param('id') id: string) {
    return this.svc.remove(Number(id));
  }

  // ---- images ----
  @Post(':id/images')
  @UseGuards(AuthGuard('jwt'))
  addImages(
    @Param('id') id: string,
    @Body() body: { images: Array<Omit<GalleryImageDto, 'galleryId'>> },
  ) {
    return this.svc.addImages(Number(id), body.images);
  }

  @Delete('images')
  @UseGuards(AuthGuard('jwt'))
  removeImages(@Body() body: { ids: number[] }) {
    return this.svc.removeImages(body.ids);
  }

  @Put('images/:id/featured')
  @UseGuards(AuthGuard('jwt'))
  setFeatured(@Param('id') id: string, @Body() body: { featured: '0' | '1' }) {
    return this.svc.setFeatured(Number(id), body.featured);
  }
}
