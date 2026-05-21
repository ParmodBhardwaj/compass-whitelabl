import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PolicyDto, PolicySectionDto, PolicyService } from './policy.service';

@Controller('policies')
@UseGuards(AuthGuard('jwt'))
export class PolicyController {
  constructor(private readonly svc: PolicyService) {}

  @Get()
  list(@Req() req: any) {
    return this.svc.list(req.user?.roles ?? []);
  }

  @Get('admin')
  listAdmin() {
    return this.svc.listAdmin();
  }

  @Get(':id')
  async detail(@Req() req: any, @Param('id') id: string) {
    const r = await this.svc.detail(Number(id), req.user?.roles ?? []);
    if (!r) throw new NotFoundException();
    return r;
  }

  @Post()
  create(@Body() body: PolicyDto) {
    return this.svc.create(body);
  }

  @Put(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() body: Partial<PolicyDto>) {
    return this.svc.update(Number(id), req.user.id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.svc.remove(Number(id));
  }

  // ---- sections ----
  @Get(':id/sections')
  sections(@Param('id') id: string) {
    return this.svc.sections(Number(id));
  }

  @Post('sections')
  createSection(@Req() req: any, @Body() body: PolicySectionDto) {
    return this.svc.createSection(body, req.user.id);
  }

  @Put('sections/:id')
  updateSection(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: Partial<PolicySectionDto>,
  ) {
    return this.svc.updateSection(Number(id), body, req.user.id);
  }

  @Delete('sections/:id')
  deleteSection(@Param('id') id: string) {
    return this.svc.deleteSection(Number(id));
  }

  // ---- admin users + roles ----
  @Get(':id/admins')
  admins(@Param('id') id: string) {
    return this.svc.adminUsers(Number(id));
  }
  @Put(':id/admins')
  setAdmins(@Param('id') id: string, @Body() body: { userIds: number[] }) {
    return this.svc.setAdminUsers(Number(id), body.userIds);
  }
  @Put(':id/roles')
  setRoles(@Param('id') id: string, @Body() body: { roleIds: number[] }) {
    return this.svc.assignRoles(Number(id), body.roleIds);
  }
  @Get(':id/logs')
  logs(@Param('id') id: string) {
    return this.svc.logs(Number(id));
  }
}
