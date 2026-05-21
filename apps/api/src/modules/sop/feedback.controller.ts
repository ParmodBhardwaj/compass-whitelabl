import { Body, Controller, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SopFeedbackService } from './feedback.service';

@Controller('sop/feedback')
@UseGuards(AuthGuard('jwt'))
export class SopFeedbackController {
  constructor(private readonly svc: SopFeedbackService) {}

  @Get()
  list(
    @Query('procedureId') procedureId?: string,
    @Query('q') q?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.svc.list({ procedureId: procedureId ? Number(procedureId) : undefined, q, from, to });
  }

  @Post()
  submit(@Req() req: any, @Body() body: { procedureId: number; message: string }) {
    return this.svc.submit(req.user.id, body.procedureId, body.message);
  }

  @Put(':id/reply')
  reply(@Param('id') id: string, @Body('reply') reply: string) {
    return this.svc.reply(Number(id), reply);
  }
}
