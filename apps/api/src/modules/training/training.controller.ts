import {
  Body, Controller, Delete, Get, Param, ParseIntPipe,
  Post, Put, Query, Req, Res, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { TrainingService, TrainingScoreDto } from './training.service';
import { ExcelService } from '../../common/excel/excel.service';
import { reportTitle } from '../../common/brand';

@Controller('training')
@UseGuards(AuthGuard('jwt'))
export class TrainingController {
  constructor(
    private readonly svc: TrainingService,
    private readonly excel: ExcelService,
  ) {}

  // ── Excel downloads ────────────────────────────────────────────────────

  /** Aggregated score-by-employee report — direct .xlsx download. */
  @Get('reports/score.xlsx')
  async scoreReportXlsx(
    @Res() res: Response,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('categoryId') categoryId?: string,
  ) {
    const rows = await this.svc.scoreReportRows({
      from, to, categoryId: categoryId ? +categoryId : undefined,
    });
    const buffer = await this.excel.sheet({
      name: 'Score Report',
      title: reportTitle('Training Score Report'),
      columns: [
        { header: 'Emp ID',      key: 'empId',       width: 10 },
        { header: 'Employee',    key: 'empName',     width: 28 },
        { header: 'Designation', key: 'designation', width: 22 },
        { header: 'Category',    key: 'category',    width: 22 },
        { header: 'Trainings',   key: 'trainings',   width: 12 },
        { header: 'Total Score', key: 'totalScore',  width: 14, format: v => Number(v ?? 0).toFixed(2) },
      ],
      rows,
    });
    res.set({
      'Content-Type': ExcelService.MIME,
      'Content-Disposition': `attachment; filename="training-score-${Date.now()}.xlsx"`,
    });
    res.send(buffer);
  }

  /** Per-record detailed training log — direct .xlsx download. */
  @Get('reports/detailed.xlsx')
  async detailedReportXlsx(
    @Res() res: Response,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('createdBy') createdBy?: string,
  ) {
    const rows = await this.svc.detailedReportRows({
      from, to, createdBy: createdBy ? +createdBy : undefined,
    });
    const buffer = await this.excel.sheet({
      name: 'Detailed Report',
      title: reportTitle('Training Detailed Report'),
      columns: [
        { header: 'ID',          key: 'id',          width: 8 },
        { header: 'Date',        key: 'date',        width: 12 },
        { header: 'Employee',    key: 'empName',     width: 24 },
        { header: 'Category',    key: 'category',    width: 18 },
        { header: 'Sub Category',key: 'subCategory', width: 18 },
        { header: 'Type',        key: 'type',        width: 22 },
        { header: 'Training',    key: 'name',        width: 32 },
        { header: 'Days',        key: 'days',        width: 8 },
        { header: 'Location',    key: 'location',    width: 18 },
        { header: 'Score',       key: 'score',       width: 10, format: v => Number(v ?? 0).toFixed(2) },
        { header: 'Learning',    key: 'learning',    width: 40 },
      ],
      rows,
    });
    res.set({
      'Content-Type': ExcelService.MIME,
      'Content-Disposition': `attachment; filename="training-detailed-${Date.now()}.xlsx"`,
    });
    res.send(buffer);
  }

  // ── Categories / Sub-categories ─────────────────────────────────────────

  @Get('categories')
  listCategories() {
    return this.svc.listCategories();
  }

  @Get('sub-categories')
  listSubCategories(@Query('categoryId') categoryId?: string) {
    return this.svc.listSubCategories(categoryId ? +categoryId : undefined);
  }

  // ── Leaderboard ─────────────────────────────────────────────────────────

  @Get('leaderboard')
  leaderboard(@Query('limit') limit?: string) {
    return this.svc.topScorersOverall(limit ? +limit : 10);
  }

  @Get('leaderboard/categories/:id')
  leaderboardByCategory(
    @Param('id', ParseIntPipe) id: number,
    @Query('limit') limit?: string,
  ) {
    return this.svc.topScorersByCategory(id, limit ? +limit : 10);
  }

  @Get('league-dashboard')
  league(@Query('perCategoryLimit') perCategoryLimit?: string) {
    return this.svc.leagueDashboard(perCategoryLimit ? +perCategoryLimit : 5);
  }

  // ── Excel report rows (consumed by the ExcelReport helper) ──────────────

  @Get('reports/score')
  scoreReport(
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('categoryId') categoryId?: string,
  ) {
    return this.svc.scoreReportRows({
      from, to, categoryId: categoryId ? +categoryId : undefined,
    });
  }

  @Get('reports/detailed')
  detailedReport(
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('createdBy') createdBy?: string,
  ) {
    return this.svc.detailedReportRows({
      from, to, createdBy: createdBy ? +createdBy : undefined,
    });
  }

  @Get('scores')
  listScores(
    @Query('createdBy') createdBy?: string,
    @Query('categoryId') categoryId?: string,
    @Query('trainingType') trainingType?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('all') all?: string,
  ) {
    return this.svc.listScores({
      createdBy: createdBy ? +createdBy : undefined,
      categoryId: categoryId ? +categoryId : undefined,
      trainingType,
      from,
      to,
      all: all === '1',
    });
  }

  @Get('stats')
  stats(@Query('createdBy') createdBy?: string) {
    return this.svc.stats(createdBy ? +createdBy : undefined);
  }

  @Get('scores/:id')
  getScore(@Param('id', ParseIntPipe) id: number) {
    return this.svc.getScore(id);
  }

  @Post('scores')
  createScore(@Body() dto: TrainingScoreDto) {
    return this.svc.createScore(dto);
  }

  @Put('scores/:id')
  updateScore(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<TrainingScoreDto>,
  ) {
    return this.svc.updateScore(id, { ...dto, actingUserId: req.user?.id });
  }

  @Delete('scores/:id')
  deleteScore(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.svc.deleteScore(id, req.user?.id);
  }

  @Get('champions')
  getChampions(@Query('locationId') locationId?: string) {
    return this.svc.getChampions(locationId ? +locationId : undefined);
  }

  @Get('pillar-campaigns')
  getPillarCampaigns(@Query('categoryId') categoryId?: string) {
    return this.svc.getPillarCampaigns(categoryId ? +categoryId : undefined);
  }
}
