import { Injectable } from '@nestjs/common';
import { Op } from '@hero/db';
import { HeroRecentview } from '@hero/db/src/models/generated';
import { getDb } from '@hero/db';

@Injectable()
export class RecentViewService {
  async track(userId: number, menuId: number, url: string) {
    return HeroRecentview.create({
      userId,
      menuId,
      url,
      creationDate: new Date(),
    } as any);
  }

  /**
   * "Recently Viewed" — distinct menu_id ordered by most recent view.
   * JOINs `menu` to populate `title`/`url`/icon so the frontend tiles render.
   */
  async recent(userId: number, limit = 12) {
    const db = getDb();
    const [rows] = await db.query(
      `SELECT r.menu_id AS menuId,
              COALESCE(m.menu_name, r.url) AS title,
              COALESCE(m.url, MAX(r.url)) AS url,
              m.class AS icon,
              MAX(r.creation_date) AS lastViewed
       FROM hero_recentview r
       LEFT JOIN menu m ON m.id = r.menu_id
       WHERE r.user_id = :uid
       GROUP BY r.menu_id, m.menu_name, m.url, m.class
       ORDER BY lastViewed DESC
       LIMIT :lim`,
      { replacements: { uid: userId, lim: limit } },
    );
    return rows;
  }

  /**
   * "Most Viewed" — top menu_id by view count for the user.
   * JOINs `menu` to populate `title`/`url`/icon so the frontend tiles render.
   */
  async mostViewed(userId: number, limit = 12) {
    const db = getDb();
    const [rows] = await db.query(
      `SELECT r.menu_id AS menuId,
              COALESCE(m.menu_name, r.url) AS title,
              COALESCE(m.url, MAX(r.url)) AS url,
              m.class AS icon,
              COUNT(*) AS views,
              MAX(r.creation_date) AS lastViewed
       FROM hero_recentview r
       LEFT JOIN menu m ON m.id = r.menu_id
       WHERE r.user_id = :uid
       GROUP BY r.menu_id, m.menu_name, m.url, m.class
       ORDER BY views DESC
       LIMIT :lim`,
      { replacements: { uid: userId, lim: limit } },
    );
    return rows;
  }

  /** Maintenance: trim very old rows. */
  async purge(daysOld = 365) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - daysOld);
    return HeroRecentview.destroy({ where: { creationDate: { [Op.lt]: cutoff } } as any });
  }
}
