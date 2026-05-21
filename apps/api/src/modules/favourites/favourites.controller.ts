import { Body, Controller, Delete, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FavouriteDto, FavouritesService } from './favourites.service';

@Controller('favourites')
@UseGuards(AuthGuard('jwt'))
export class FavouritesController {
  constructor(private readonly svc: FavouritesService) {}

  @Get()
  list(@Req() req: any) {
    return this.svc.listForUser(req.user.id);
  }

  @Post()
  add(@Req() req: any, @Body() body: FavouriteDto) {
    return this.svc.add(req.user.id, body);
  }

  @Delete('by-menu/:menuId')
  removeByMenu(@Req() req: any, @Param('menuId') menuId: string) {
    return this.svc.removeByMenu(req.user.id, Number(menuId));
  }

  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    return this.svc.remove(req.user.id, Number(id));
  }
}
