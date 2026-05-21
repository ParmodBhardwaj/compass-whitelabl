/**
 * Training module — parity tests.
 */
export default {
  name: 'Training',
  tests: [
    {
      name: 'GET /scores?all=1 count matches DB',
      api: 'GET /v2/training/scores?all=1',
      sql: `SELECT COUNT(*) AS cnt FROM training_score WHERE is_deleted='0'`,
      check: (api, db) => {
        const a = Array.isArray(api) ? api.length : 0;
        const d = Number(db[0].cnt);
        return a === d ? { ok: true } : { ok: false, reason: `api=${a} db=${d}` };
      },
    },

    {
      name: 'GET /categories returns type=training only',
      api: 'GET /v2/training/categories',
      sql: `SELECT COUNT(*) AS cnt FROM hero_category WHERE type='training' AND is_deleted='0'`,
      check: (api, db) => {
        const a = Array.isArray(api) ? api.length : 0;
        const d = Number(db[0].cnt);
        if (a !== d) return { ok: false, reason: `api=${a} db=${d}` };
        // None of the returned rows should have type != 'training'
        const wrongs = (api ?? []).filter((c) => c.type && c.type !== 'training');
        return wrongs.length
          ? { ok: false, reason: `${wrongs.length} rows with type != 'training'` }
          : { ok: true };
      },
    },

    {
      name: 'GET /sub-categories filters by categoryId',
      api: 'GET /v2/training/sub-categories?categoryId=1',
      sql: `SELECT COUNT(*) AS cnt FROM hero_sub_category WHERE type='training' AND is_deleted='0' AND category_id=1`,
      check: (api, db) => {
        const a = Array.isArray(api) ? api.length : 0;
        const d = Number(db[0].cnt);
        return a === d ? { ok: true } : { ok: false, reason: `api=${a} db=${d}` };
      },
    },

    {
      name: 'GET /leaderboard returns DESC totals',
      api: 'GET /v2/training/leaderboard?limit=20',
      sql: `SELECT created_by, SUM(training_score) AS total
              FROM training_score WHERE is_deleted='0'
              GROUP BY created_by ORDER BY total DESC LIMIT 20`,
      check: (api, db) => {
        if (!Array.isArray(api)) return { ok: false, reason: 'API returned non-array' };
        // Strict count match
        if (api.length !== db.length) {
          return { ok: false, reason: `api=${api.length} db=${db.length}` };
        }
        // Verify DESC order on totalScore
        for (let i = 1; i < api.length; i++) {
          if (Number(api[i - 1].totalScore) < Number(api[i].totalScore)) {
            return { ok: false, reason: `not DESC at index ${i}` };
          }
        }
        // Top-N user IDs must match (allowing ties to swap)
        const apiTop = new Set(api.slice(0, 5).map((r) => r.userId));
        const dbTop = new Set(db.slice(0, 5).map((r) => r.created_by));
        const overlap = [...apiTop].filter((u) => dbTop.has(u)).length;
        return overlap >= Math.min(3, apiTop.size)
          ? { ok: true }
          : { ok: false, reason: `top-5 overlap only ${overlap}` };
      },
    },

    {
      name: 'GET /stats avgScore matches DB',
      api: 'GET /v2/training/stats',
      sql: `SELECT COUNT(*) AS total, AVG(training_score) AS avgScore
              FROM training_score WHERE is_deleted='0'`,
      check: (api, db) => {
        const dbTotal = Number(db[0].total);
        const dbAvg = Number(db[0].avgScore ?? 0);
        if (Number(api?.total ?? -1) !== dbTotal) {
          return { ok: false, reason: `total api=${api?.total} db=${dbTotal}` };
        }
        // avgScore should match within 0.01
        if (Math.abs(Number(api?.avgScore ?? 0) - dbAvg) > 0.01) {
          return { ok: false, reason: `avg api=${api?.avgScore} db=${dbAvg.toFixed(2)}` };
        }
        return { ok: true };
      },
    },

    {
      name: 'GET /league-dashboard structure',
      api: 'GET /v2/training/league-dashboard?perCategoryLimit=3',
      sql: `SELECT COUNT(*) AS cnt FROM hero_category WHERE type='training' AND is_deleted='0'`,
      check: (api, db) => {
        if (!api || !Array.isArray(api.overall) || !Array.isArray(api.perCategory)) {
          return { ok: false, reason: 'missing overall or perCategory' };
        }
        const dbCat = Number(db[0].cnt);
        return api.perCategory.length === dbCat
          ? { ok: true }
          : { ok: false, reason: `perCategory.length=${api.perCategory.length} categories=${dbCat}` };
      },
    },
  ],
};
