import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MenuDto, MenuService } from './menu.service';

@Controller('menus')
export class MenuController {
  constructor(private readonly svc: MenuService) {}

  /**
   * Tree for the logged-in user.
   *
   * Defaults: store=1, position=1 (sidebar). Override via ?store=N&position=0|1|2.
   * Role-based filtering uses the JWT-decoded roles array.
   */
  @Get()
  @UseGuards(AuthGuard('jwt'))
  tree(
    @Req() req: any,
    @Query('store') store: string = '1',
    @Query('position') position: '0' | '1' | '2' = '1',
  ) {
    return this.svc.getTree({
      storeId: Number(store),
      position,
      roleIds: req.user?.roles ?? [],
      userId: req.user?.id,
    });
  }

  /** Flat list for admin grid (no role filtering). */
  @Get('admin')
  @UseGuards(AuthGuard('jwt'))
  flat(@Query('store') store?: string, @Query('position') position?: '0' | '1' | '2') {
    return this.svc.listFlat({
      storeId: store ? Number(store) : undefined,
      position,
    });
  }

  /**
   * Admin sidebar navigation tree for the given portal, filtered by the
   * caller's role-based permissions (`acl_resources`).
   *
   * Powered by the legacy `store_modules` table. Selecting a different portal
   * from the admin "Select Portal" dropdown reloads this endpoint and
   * the sidebar updates to show that portal's admin modules.
   */
  @Get('admin/navigation')
  @UseGuards(AuthGuard('jwt'))
  adminNavigation(@Req() req: any, @Query('store') store: string = '1') {
    return this.svc.getAdminNavigation(
      Number(store),
      req.user?.id,
      Array.isArray(req.user?.roles) ? req.user.roles : [],
    );
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  create(@Body() body: MenuDto) {
    return this.svc.create(body);
  }

  @Put('reorder')
  @UseGuards(AuthGuard('jwt'))
  reorder(@Body() body: { items: Array<{ id: number; ordering: number; parentId?: number }> }) {
    return this.svc.reorder(body.items);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'))
  update(@Param('id') id: string, @Body() body: Partial<MenuDto>) {
    return this.svc.update(Number(id), body);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  remove(@Param('id') id: string) {
    return this.svc.remove(Number(id));
  }
}
