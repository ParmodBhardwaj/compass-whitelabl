import {
  Body, Controller, Delete, ForbiddenException, Get, Param, ParseIntPipe,
  Post, Put, Query, Req, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AclService } from './acl.service';

/**
 * Block any non-admin caller. Mirrors the Sidebar's "isAdmin" rule:
 *   user.id === 1  OR  user.roles includes 9 (Super Admin)
 */
function assertAdmin(req: any) {
  const user = req.user ?? {};
  const isAdmin = user.id === 1 || (Array.isArray(user.roles) && user.roles.includes(9));
  if (!isAdmin) throw new ForbiddenException('Admin role required');
}

@Controller('acl')
@UseGuards(AuthGuard('jwt'))
export class AclController {
  constructor(private readonly svc: AclService) {}

  // ── Stores (Portals) ─────────────────────────────────────────────────────

  /**
   * Portals the *current* user has access to — used by the admin header's
   * "Select Portal" dropdown. Always authenticated; never requires admin.
   * Empty list = user has no role mapped to any store.
   */
  @Get('stores/mine')
  myStores(@Req() req: any) {
    const userId = req.user?.id;
    if (!userId) return [];
    return this.svc.listStoresForUser(userId);
  }

  /** Full store catalog — Super Admin only. */
  @Get('stores')
  listStores(@Req() req: any) {
    assertAdmin(req);
    return this.svc.listAllStores();
  }

  // ── Categories ──────────────────────────────────────────────────────────

  @Get('categories')
  listCategories(@Req() req: any) {
    assertAdmin(req);
    return this.svc.listCategories();
  }

  @Post('categories')
  createCategory(@Req() req: any, @Body() body: { categoryName: string }) {
    assertAdmin(req);
    return this.svc.createCategory(body);
  }

  @Put('categories/:id')
  updateCategory(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { categoryName: string },
  ) {
    assertAdmin(req);
    return this.svc.updateCategory(id, body);
  }

  @Delete('categories/:id')
  deleteCategory(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    assertAdmin(req);
    return this.svc.deleteCategory(id);
  }

  // ── Roles ───────────────────────────────────────────────────────────────

  @Get('roles')
  listRoles(
    @Req() req: any,
    @Query('categoryId') categoryId?: string,
    @Query('storeId') storeId?: string,
    @Query('q') q?: string,
  ) {
    assertAdmin(req);
    return this.svc.listRoles({
      categoryId: categoryId ? +categoryId : undefined,
      storeId: storeId ? +storeId : undefined,
      q,
    });
  }

  @Get('roles/:id')
  getRole(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    assertAdmin(req);
    return this.svc.getRole(id);
  }

  @Post('roles')
  createRole(
    @Req() req: any,
    @Body() body: { name: string; roleCategory?: number; isFixed?: '0' | '1'; storeId?: number },
  ) {
    assertAdmin(req);
    return this.svc.createRole(body);
  }

  @Put('roles/:id')
  updateRole(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: Partial<{ name: string; roleCategory: number; isFixed: '0' | '1'; storeId: number }>,
  ) {
    assertAdmin(req);
    return this.svc.updateRole(id, body);
  }

  @Delete('roles/:id')
  deleteRole(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    assertAdmin(req);
    return this.svc.deleteRole(id);
  }

  // ── Role members ────────────────────────────────────────────────────────

  @Get('roles/:id/members')
  listMembers(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    assertAdmin(req);
    return this.svc.listRoleMembers(id);
  }

  @Post('roles/:id/members')
  addMember(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { userId: number },
  ) {
    assertAdmin(req);
    return this.svc.addRoleMember(id, body.userId);
  }

  @Delete('roles/:id/members/:userId')
  removeMember(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    assertAdmin(req);
    return this.svc.removeRoleMember(id, userId);
  }

  @Put('roles/:id/members')
  setMembers(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { userIds: number[] },
  ) {
    assertAdmin(req);
    return this.svc.setRoleMembers(id, body.userIds ?? []);
  }

  // ── Resources ───────────────────────────────────────────────────────────

  @Get('roles/:id/resources')
  listResources(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    assertAdmin(req);
    return this.svc.listResources(id);
  }

  @Post('roles/:id/resources')
  addResource(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { routeName: string; action: string; type?: '0' | '1' },
  ) {
    assertAdmin(req);
    return this.svc.addResource({ ...body, roleId: id });
  }

  @Put('roles/:id/resources')
  setResources(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { resources: Array<{ routeName: string; action: string; type?: '0' | '1' }> },
  ) {
    assertAdmin(req);
    return this.svc.setRoleResources(id, body.resources ?? []);
  }

  @Delete('resources/:resourceId')
  deleteResource(@Req() req: any, @Param('resourceId', ParseIntPipe) resourceId: number) {
    assertAdmin(req);
    return this.svc.deleteResource(resourceId);
  }
}
