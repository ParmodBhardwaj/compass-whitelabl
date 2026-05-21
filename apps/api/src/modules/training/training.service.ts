import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Op, QueryTypes, getDb } from '@hero/db';
import {
  TrainingScore,
  TrainingChampionsAmbassadors,
  TrainingPillarCampaigns,
  HeroCategory,
  HeroSubCategory,
} from '@hero/db/src/models/generated';

export interface TrainingScoreDto {
  categoryId: number;
  subCategoryId?: number;
  trainingType: string;
  trainingName: string;
  trainingDate: string;
  trainingDays: number;
  trainingLocation: string;
  trainingLearning: string;
  trainingScore: number;
  createdBy: number;
}

/**
 * Training — Wave 3 module.
 *
 * Employees log their training records (scores, learnings).
 * Champions and ambassadors are configured per location.
 *
 * Tables:
 *   training_score                  — individual training records
 *   training_champions_ambassadors  — champion + ambassador per location
 *   training_pillar_campaigns       — pillar campaign mappings
 */
@Injectable()
export class TrainingService {
  // ── Training scores ──────────────────────────────────────────────────────────

  async listScores(opts: {
    createdBy?: number;
    categoryId?: number;
    trainingType?: string;
    from?: string;
    to?: string;
    all?: boolean;
  } = {}) {
    const where: any = { isDeleted: '0' };
    if (opts.categoryId) where.categoryId = opts.categoryId;
    if (opts.trainingType) where.trainingType = opts.trainingType;
    if (opts.from && opts.to) {
      where.trainingDate = { [Op.between]: [opts.from, opts.to] };
    } else if (opts.from) {
      where.trainingDate = { [Op.gte]: opts.from };
    }
    if (!opts.all && opts.createdBy) where.createdBy = opts.createdBy;
    return TrainingScore.findAll({
      where,
      order: [['trainingDate', 'DESC']],
    });
  }

  async getScore(id: number) {
    const score = await TrainingScore.findByPk(id);
    if (!score) throw new NotFoundException('Training record not found');
    return score;
  }

  /**
   * Auto-calculate the score for a training entry, matching legacy
   * `IndexController::addAction` rules:
   *   • trainingType = 'LIY-Booking Reading'        → 150
   *   • trainingType = 'LIY-Book Reading Panel Member' → 500
   *   • otherwise → use the sub-category `extraField` value (per-day points)
   *     multiplied by trainingDays.
   * Returns the explicit `trainingScore` if provided.
   */
  async computeScore(dto: Pick<TrainingScoreDto, 'trainingType' | 'subCategoryId' | 'trainingDays' | 'trainingScore'>): Promise<number> {
    if (dto.trainingScore && dto.trainingScore > 0) return dto.trainingScore;
    if (dto.trainingType === 'LIY-Booking Reading') return 150;
    if (dto.trainingType === 'LIY-Book Reading Panel Member') return 500;
    if (dto.subCategoryId) {
      const sub = await HeroSubCategory.findByPk(dto.subCategoryId);
      const perDay = parseFloat(((sub as any)?.extraField ?? '0').toString());
      if (!isNaN(perDay) && perDay > 0) {
        return perDay * Math.max(1, dto.trainingDays || 1);
      }
    }
    return 0;
  }

  async createScore(dto: TrainingScoreDto) {
    const score = await this.computeScore(dto);
    return TrainingScore.create({
      categoryId: dto.categoryId,
      subCategoryId: dto.subCategoryId ?? null,
      trainingType: dto.trainingType,
      trainingName: dto.trainingName,
      trainingDate: dto.trainingDate,
      trainingDays: dto.trainingDays,
      trainingLocation: dto.trainingLocation,
      trainingLearning: dto.trainingLearning,
      trainingScore: score,
      createdBy: dto.createdBy,
      isDeleted: '0',
      createdOn: new Date(),
    } as any);
  }

  /**
   * Update — enforces legacy ownership rule: only the creator can edit.
   * Pass `actingUserId` so the service can compare against `created_by`.
   */
  async updateScore(id: number, dto: Partial<TrainingScoreDto> & { actingUserId?: number }) {
    const score = await TrainingScore.findByPk(id);
    if (!score) throw new NotFoundException('Training record not found');
    if (dto.actingUserId && (score as any).createdBy !== dto.actingUserId) {
      throw new ForbiddenException('You can only edit training records you created.');
    }
    // Recompute score if relevant fields changed.
    const merged = { ...(score as any).get(), ...dto } as TrainingScoreDto;
    const newScore = await this.computeScore(merged);
    const { actingUserId: _omit, ...rest } = dto as any;
    await score.update({ ...rest, trainingScore: newScore } as any);
    return score;
  }

  async deleteScore(id: number, actingUserId?: number) {
    const score = await TrainingScore.findByPk(id);
    if (!score) throw new NotFoundException('Training record not found');
    if (actingUserId && (score as any).createdBy !== actingUserId) {
      throw new ForbiddenException('You can only delete training records you created.');
    }
    await score.update({ isDeleted: '1' } as any);
    return { id, deleted: true };
  }

  // ── Categories / Sub-categories ───────────────────────────────────────────
  //
  // Training categories live in `hero_category` WHERE type='training'.
  // Sub-categories in `hero_sub_category` WHERE type='training' (filtered by
  // parent category_id).

  async listCategories() {
    return HeroCategory.findAll({
      where: { type: 'training', isDeleted: '0' } as any,
      order: [['sortOrder', 'ASC'], ['id', 'ASC']],
    });
  }

  async listSubCategories(categoryId?: number) {
    const where: any = { type: 'training', isDeleted: '0' };
    if (categoryId) where.categoryId = categoryId;
    return HeroSubCategory.findAll({
      where,
      order: [['sortOrder', 'ASC'], ['id', 'ASC']],
    });
  }

  // ── Leaderboard / Top scorers ─────────────────────────────────────────────
  //
  // Legacy `HomeController::getTopScorers()` returned top N scorers per
  // category for the league page. We expose two flavors:
  //   • overall leaderboard (sum across categories)
  //   • per-category top scorers

  async topScorersOverall(limit = 10) {
    const rows = (await getDb().query(
      `SELECT ts.created_by AS userId,
              e.name        AS name,
              e.designation AS designation,
              e.profilepic  AS profilepic,
              SUM(ts.training_score) AS totalScore,
              COUNT(*)      AS trainingCount
         FROM training_score ts
         LEFT JOIN employee e ON e.user_id = ts.created_by
        WHERE ts.is_deleted = '0'
        GROUP BY ts.created_by
        ORDER BY totalScore DESC
        LIMIT :limit`,
      { replacements: { limit }, type: QueryTypes.SELECT },
    )) as Array<{ userId: number; name: string; designation?: string; profilepic?: string; totalScore: number; trainingCount: number }>;
    return rows;
  }

  async topScorersByCategory(categoryId: number, limit = 10) {
    const rows = (await getDb().query(
      `SELECT ts.created_by AS userId,
              e.name        AS name,
              e.designation AS designation,
              e.profilepic  AS profilepic,
              SUM(ts.training_score) AS totalScore,
              COUNT(*)      AS trainingCount
         FROM training_score ts
         LEFT JOIN employee e ON e.user_id = ts.created_by
        WHERE ts.is_deleted = '0' AND ts.category_id = :categoryId
        GROUP BY ts.created_by
        ORDER BY totalScore DESC
        LIMIT :limit`,
      { replacements: { categoryId, limit }, type: QueryTypes.SELECT },
    )) as Array<{ userId: number; name: string; designation?: string; profilepic?: string; totalScore: number; trainingCount: number }>;
    return rows;
  }

  /**
   * Aggregate league dashboard payload — overall top + per-category top
   * scorers in one round-trip for the legacy `/league.html`.
   */
  async leagueDashboard(perCategoryLimit = 5) {
    const categories = await this.listCategories();
    const overall = await this.topScorersOverall(10);
    const perCategory = [] as Array<{ categoryId: number; name: string; scorers: any[] }>;
    for (const c of categories as any[]) {
      const scorers = await this.topScorersByCategory(c.id, perCategoryLimit);
      perCategory.push({ categoryId: c.id, name: c.name, scorers });
    }
    return { overall, perCategory };
  }

  // ── Excel report export ──────────────────────────────────────────────────
  //
  // Legacy `ReportController::indexAction` produced a Score Report Excel
  // and a Detailed Report Excel. We return the rows as JSON here; the
  // common ExcelReport service then turns them into an XLSX response.

  async scoreReportRows(opts: { from?: string; to?: string; categoryId?: number } = {}) {
    const where: any = ['ts.is_deleted = "0"'];
    const replacements: any = {};
    if (opts.from) { where.push('ts.training_date >= :from'); replacements.from = opts.from; }
    if (opts.to)   { where.push('ts.training_date <= :to');   replacements.to = opts.to; }
    if (opts.categoryId) { where.push('ts.category_id = :cid'); replacements.cid = opts.categoryId; }
    const rows = (await getDb().query(
      `SELECT e.user_id      AS empId,
              e.name         AS empName,
              e.designation AS designation,
              c.name         AS category,
              COUNT(*)       AS trainings,
              SUM(ts.training_score) AS totalScore
         FROM training_score ts
         LEFT JOIN employee e ON e.user_id = ts.created_by
         LEFT JOIN hero_category c ON c.id = ts.category_id
        WHERE ${where.join(' AND ')}
        GROUP BY e.user_id, c.id
        ORDER BY totalScore DESC`,
      { replacements, type: QueryTypes.SELECT },
    )) as any[];
    return rows;
  }

  async detailedReportRows(opts: { from?: string; to?: string; createdBy?: number } = {}) {
    const where: any = ['ts.is_deleted = "0"'];
    const replacements: any = {};
    if (opts.from) { where.push('ts.training_date >= :from'); replacements.from = opts.from; }
    if (opts.to)   { where.push('ts.training_date <= :to');   replacements.to = opts.to; }
    if (opts.createdBy) { where.push('ts.created_by = :uid'); replacements.uid = opts.createdBy; }
    const rows = (await getDb().query(
      `SELECT ts.id, ts.training_date AS date, ts.training_name AS name,
              ts.training_type AS type, ts.training_days AS days,
              ts.training_location AS location, ts.training_score AS score,
              ts.training_learning AS learning,
              e.name AS empName, c.name AS category, sc.name AS subCategory
         FROM training_score ts
         LEFT JOIN employee e ON e.user_id = ts.created_by
         LEFT JOIN hero_category c ON c.id = ts.category_id
         LEFT JOIN hero_sub_category sc ON sc.id = ts.sub_category_id
        WHERE ${where.join(' AND ')}
        ORDER BY ts.training_date DESC`,
      { replacements, type: QueryTypes.SELECT },
    )) as any[];
    return rows;
  }

  // ── Champions / ambassadors ──────────────────────────────────────────────────

  async getChampions(locationId?: number) {
    const where: any = {};
    if (locationId) where.locationId = locationId;
    return TrainingChampionsAmbassadors.findAll({ where });
  }

  // ── Pillar campaigns ─────────────────────────────────────────────────────────

  async getPillarCampaigns(categoryId?: number) {
    const where: any = {};
    if (categoryId) where.categoryId = categoryId;
    return TrainingPillarCampaigns.findAll({ where });
  }

  // ── Stats ────────────────────────────────────────────────────────────────────

  async stats(createdBy?: number) {
    const base: any = { isDeleted: '0' };
    if (createdBy) base.createdBy = createdBy;
    const [total, avgScoreResult] = await Promise.all([
      TrainingScore.count({ where: base }),
      TrainingScore.findAll({
        where: base,
        attributes: [[TrainingScore.sequelize!.fn('AVG', TrainingScore.sequelize!.col('training_score')), 'avgScore']],
        raw: true,
      }),
    ]);
    const avgScore = parseFloat((avgScoreResult[0] as any)?.avgScore ?? '0');
    return { total, avgScore: isNaN(avgScore) ? 0 : avgScore };
  }
}
