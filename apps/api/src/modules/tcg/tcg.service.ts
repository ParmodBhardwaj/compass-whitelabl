import { Injectable } from '@nestjs/common';
import { Op, QueryTypes, getDb } from '@hero/db';
import {
  HeroTcgLoginUsage,
  HeroRndNoticeBoard,
  HeroRndJoinees,
  HeroRndCompetitorProduct,
} from '@hero/db/src/models/generated';

/**
 * TCG (Talent & Capability Grid) Portal — Wave 3 module.
 *
 * Mirrors the legacy `module/Tcg/`. In the legacy code TCG reuses the R&D
 * data model (notice board, joinees, competitor products) — see the
 * `Tcg\Entity\Notice` Doctrine alias mapping to `hero_rnd_notice_board`.
 *
 * Tables:
 *   hero_tcg_login_usage      — TCG-specific login analytics
 *   hero_rnd_notice_board     — shared with R&D (notice text blocks)
 *   hero_rnd_joinees          — shared with R&D (new joiners)
 *   hero_rnd_competitor_product — shared with R&D (competitor catalog)
 */
@Injectable()
export class TcgService {
  /**
   * One-shot dashboard payload used by /portal/tcg landing.
   * Pulls notice + joinees (filtered by `storeId` 6 in legacy) +
   * competitor products + the TCG-specific login-usage count.
   */
  async getDashboard(storeId = 6) {
    const [notice, joinees, products, loginCount] = await Promise.all([
      HeroRndNoticeBoard.findByPk(1),
      HeroRndJoinees.findAll({
        where: { status: '1', storeId } as any,
        order: [['id', 'DESC']],
        limit: 12,
      }),
      HeroRndCompetitorProduct.findAll({
        where: { status: '1' } as any,
        order: [['id', 'ASC']],
      }),
      HeroTcgLoginUsage.count(),
    ]);
    return { notice, joinees, products, loginCount };
  }

  /**
   * Track a TCG portal visit. Legacy fired this on every landing-page hit so
   * managers could see TCG adoption metrics. We dedupe per (user, day) to
   * avoid bloating the table on refresh.
   */
  async trackLogin(userId: number, email?: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const existing = await HeroTcgLoginUsage.findOne({
      where: { userId, creationDate: { [Op.gte]: today } } as any,
    });
    if (existing) return existing;
    return HeroTcgLoginUsage.create({
      userId,
      email: email ?? null,
      creationDate: new Date(),
    } as any);
  }

  /** Login stats for the TCG admin dashboard. */
  async loginStats(opts: { from?: string; to?: string } = {}) {
    const where: any = {};
    if (opts.from && opts.to) {
      where.creationDate = { [Op.between]: [opts.from, opts.to] };
    } else if (opts.from) {
      where.creationDate = { [Op.gte]: opts.from };
    }
    const [total, uniqueUsers] = await Promise.all([
      HeroTcgLoginUsage.count({ where }),
      getDb()
        .query<{ cnt: number }>(
          'SELECT COUNT(DISTINCT user_id) AS cnt FROM hero_tcg_login_usage' +
            (opts.from && opts.to ? ' WHERE creation_date BETWEEN :from AND :to' : ''),
          { replacements: opts, type: QueryTypes.SELECT },
        )
        .then((rows) => Number((rows as any[])[0]?.cnt ?? 0)),
    ]);
    return { total, uniqueUsers };
  }

  /** Daily login trend, one row per day, for the last `days` days. */
  async loginTrend(days = 30) {
    const rows = (await getDb().query(
      `SELECT DATE(creation_date) AS day, COUNT(*) AS visits, COUNT(DISTINCT user_id) AS users
         FROM hero_tcg_login_usage
        WHERE creation_date >= DATE_SUB(CURDATE(), INTERVAL :days DAY)
        GROUP BY DATE(creation_date)
        ORDER BY day ASC`,
      { replacements: { days }, type: QueryTypes.SELECT },
    )) as Array<{ day: string; visits: number; users: number }>;
    return rows;
  }
}
