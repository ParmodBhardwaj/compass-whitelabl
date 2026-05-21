import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { IdeaService } from './idea.service';

@Controller('idea')
@UseGuards(AuthGuard('jwt'))
export class IdeaController {
  constructor(private readonly svc: IdeaService) {}

  // ── Campaigns ──────────────────────────────────────────────────────────────

  @Get('campaigns')
  listCampaigns(@Query('status') status?: string, @Query('all') all?: string) {
    return this.svc.listCampaigns({ status, all: all === '1' });
  }

  @Get('campaigns/active')
  activeCampaigns() {
    return this.svc.getActiveCampaigns();
  }

  @Get('campaigns/:id')
  getCampaign(@Param('id', ParseIntPipe) id: number) {
    return this.svc.getCampaign(id);
  }

  @Post('campaigns')
  createCampaign(@Body() body: {
    title: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    status?: string;
    groupAllowed?: string;
    createdBy?: number;
  }) {
    return this.svc.createCampaign(body);
  }

  @Put('campaigns/:id')
  updateCampaign(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: Partial<{
      title: string;
      description: string;
      startDate: string;
      endDate: string;
      status: string;
      groupAllowed: string;
    }>,
  ) {
    return this.svc.updateCampaign(id, body);
  }

  // ── Submissions ───────────────────────────────────────────────────────────

  @Get('submissions')
  listSubmissions(
    @Query('ideaId') ideaId?: string,
    @Query('submittedBy') submittedBy?: string,
    @Query('all') all?: string,
  ) {
    return this.svc.listSubmissions({
      ideaId: ideaId ? +ideaId : undefined,
      submittedBy: submittedBy ? +submittedBy : undefined,
      all: all === '1',
    });
  }

  @Get('submissions/:id')
  getSubmission(@Param('id', ParseIntPipe) id: number) {
    return this.svc.getSubmission(id);
  }

  @Post('submissions')
  createSubmission(@Body() body: any) {
    return this.svc.createSubmission(body);
  }

  @Put('submissions/:id')
  updateSubmission(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.svc.updateSubmission(id, body);
  }

  @Delete('submissions/:id')
  deleteSubmission(@Param('id', ParseIntPipe) id: number) {
    return this.svc.deleteSubmission(id);
  }
}
