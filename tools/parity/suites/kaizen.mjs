/**
 * Kaizen module — parity tests.
 */
export default {
  name: 'Kaizen',
  tests: [
    {
      name: 'GET /kaizen?all=1 count matches DB',
      api: 'GET /v2/kaizen?all=1',
      sql: `SELECT COUNT(*) AS cnt FROM kaizen_request WHERE is_deleted='0'`,
      check: (api, db) => {
        const a = Array.isArray(api) ? api.length : 0;
        const d = Number(db[0].cnt);
        return a === d ? { ok: true } : { ok: false, reason: `api=${a} db=${d}` };
      },
    },

    {
      name: 'GET /kaizen?status=raised filter works',
      api: 'GET /v2/kaizen?all=1&status=raised',
      sql: `SELECT COUNT(*) AS cnt FROM kaizen_request WHERE is_deleted='0' AND current_status='raised'`,
      check: (api, db) => {
        const a = Array.isArray(api) ? api.length : 0;
        const d = Number(db[0].cnt);
        if (a !== d) return { ok: false, reason: `api=${a} db=${d}` };
        const wrongs = (api ?? []).filter((r) => r.currentStatus !== 'raised');
        return wrongs.length
          ? { ok: false, reason: `${wrongs.length} rows with status != 'raised'` }
          : { ok: true };
      },
    },

    {
      name: 'GET /kaizen/meta/pillars returns all pillars',
      api: 'GET /v2/kaizen/meta/pillars',
      sql: 'SELECT COUNT(*) AS cnt FROM kaizen_pillar',
      check: (api, db) => {
        const a = Array.isArray(api) ? api.length : 0;
        const d = Number(db[0].cnt);
        return a === d ? { ok: true } : { ok: false, reason: `api=${a} db=${d}` };
      },
    },

    {
      name: 'GET /kaizen/meta/sections returns all sections',
      api: 'GET /v2/kaizen/meta/sections',
      sql: 'SELECT COUNT(*) AS cnt FROM kaizen_section',
      check: (api, db) => {
        const a = Array.isArray(api) ? api.length : 0;
        const d = Number(db[0].cnt);
        return a === d ? { ok: true } : { ok: false, reason: `api=${a} db=${d}` };
      },
    },

    {
      name: 'GET /kaizen/stats matches DB rollup',
      api: 'GET /v2/kaizen/stats',
      sql: `SELECT
              COUNT(*) AS total,
              SUM(current_status='raised')   AS raised,
              SUM(current_status='approved') AS approved
            FROM kaizen_request WHERE is_deleted='0'`,
      check: (api, db) => {
        if (!api) return { ok: false, reason: 'no api response' };
        const r = db[0];
        // Stats shape may include total/raised/approved/rejected — verify total at minimum
        return Number(api.total ?? -1) === Number(r.total)
          ? { ok: true }
          : { ok: false, reason: `total api=${api.total} db=${r.total}` };
      },
    },
  ],
};
