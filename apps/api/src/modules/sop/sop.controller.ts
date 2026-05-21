import { Body, Controller, Get, NotFoundException, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SopService, SopActivityKind } from './sop.service';

@Controller('sop')
@UseGuards(AuthGuard('jwt'))
export class SopController {
  constructor(private readonly svc: SopService) {}

  @Get('sections')
  sections() {
    return this.svc.sections();
  }

  @Get('processes')
  list(@Query('section') section?: string, @Query('q') q?: string) {
    return this.svc.listProcesses({ sectionId: section ? Number(section) : undefined, q });
  }

  @Get('processes/:id')
  async detail(@Param('id') id: string) {
    const r = await this.svc.detail(Number(id));
    if (!r) throw new NotFoundException();
    return r;
  }

  @Get('procedures/:id/files')
  files(@Param('id') id: string) {
    return this.svc.procedureFiles(Number(id));
  }

  /** Front-end calls this when user views an SOP page or downloads a file. */
  @Post('activity')
  log(@Req() req: any, @Body() body: { kind: SopActivityKind; detail: string }) {
    return this.svc.logActivity(req.user.id, body.kind, body.detail);
  }
}
