import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ActivityTrackerService } from './activity-tracker.service';

/**
 * REST API for Activity Tracker.
 *
 * All endpoints require JWT auth except meta/programs (read-only list).
 *
 * Programs  → /activity-tracker/programs
 * Tasks     → /activity-tracker/tasks
 * Revise    → /activity-tracker/tasks/:id/revise
 * Transfer  → /activity-tracker/tasks/:id/transfer
 */
@Controller('activity-tracker')
@UseGuards(AuthGuard('jwt'))
export class ActivityTrackerController {
  constructor(private readonly svc: ActivityTrackerService) {}

  // ── Programs ──────────────────────────────────────────────────────────────

  @Get('programs')
  listPrograms(@Query('departmentId') departmentId?: string, @Query('all') all?: string) {
    if (all === '1') return this.svc.listProgramsAdmin();
    return this.svc.listPrograms(departmentId ? { departmentId: +departmentId } : {});
  }

  @Get('programs/:id')
  getProgram(@Param('id', ParseIntPipe) id: number) {
    return this.svc.getProgram(id);
  }

  @Post('programs')
  createProgram(@Body() body: any) {
    return this.svc.createProgram(body);
  }

  @Put('programs/:id')
  updateProgram(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.svc.updateProgram(id, body);
  }

  @Delete('programs/:id')
  removeProgram(@Param('id', ParseIntPipe) id: number) {
    return this.svc.removeProgram(id);
  }

  // ── Tasks ─────────────────────────────────────────────────────────────────

  @Get('tasks')
  listTasks(
    @Query('userId') userId?: string,
    @Query('programId') programId?: string,
    @Query('status') status?: string,
    @Query('all') all?: string,
  ) {
    return this.svc.listTasks({
      userId: userId ? +userId : undefined,
      programId: programId ? +programId : undefined,
      status,
      all: all === '1',
    });
  }

  @Get('tasks/:id')
  getTask(@Param('id', ParseIntPipe) id: number) {
    return this.svc.getTask(id);
  }

  @Post('tasks')
  createTask(@Body() body: any) {
    return this.svc.createTask(body);
  }

  @Put('tasks/:id')
  updateTask(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.svc.updateTask(id, body);
  }

  @Delete('tasks/:id')
  removeTask(@Param('id', ParseIntPipe) id: number) {
    return this.svc.removeTask(id);
  }

  // ── Revise Requests ───────────────────────────────────────────────────────

  @Post('tasks/:id/revise')
  requestRevise(@Param('id', ParseIntPipe) taskId: number, @Body() body: any) {
    return this.svc.requestRevise({ ...body, taskId });
  }

  @Put('revise-requests/:id/action')
  actionRevise(@Param('id', ParseIntPipe) reviseId: number, @Body() body: any) {
    return this.svc.actionRevise(reviseId, body);
  }

  // ── Transfer Requests ─────────────────────────────────────────────────────

  @Post('tasks/:id/transfer')
  requestTransfer(@Param('id', ParseIntPipe) taskId: number, @Body() body: any) {
    return this.svc.requestTransfer({ ...body, taskId });
  }

  @Put('transfer-requests/:id/action')
  actionTransfer(@Param('id', ParseIntPipe) transferId: number, @Body() body: any) {
    return this.svc.actionTransfer(transferId, body);
  }

  // ── Escalation (internal — called by BullMQ worker) ─────────────────────

  @Get('escalation/due')
  tasksForEscalation(@Query('trigger') trigger: any) {
    return this.svc.tasksForEscalation(trigger);
  }

  @Post('escalation/record')
  recordEscalation(@Body() body: { taskId: number }) {
    return this.svc.recordEscalationSent(body.taskId);
  }
}
