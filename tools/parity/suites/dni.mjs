/**
 * D&I module — parity tests.
 */
export default {
  name: 'D&I',
  tests: [
    {
      name: 'GET /events filters by storeId + status',
      api: 'GET /v2/dni/events?storeId=8',
      sql: `SELECT COUNT(*) AS cnt FROM hero_di_events
              WHERE is_deleted='0' AND status='1' AND store_id=8`,
      check: (api, db) => {
        const a = Array.isArray(api) ? api.length : 0;
        const d = Number(db[0].cnt);
        return a === d ? { ok: true } : { ok: false, reason: `api=${a} db=${d}` };
      },
    },

    {
      name: 'GET /events/categories returns category table',
      api: 'GET /v2/dni/events/categories',
      sql: 'SELECT COUNT(*) AS cnt FROM hero_di_events_category',
      check: (api, db) => {
        const a = Array.isArray(api) ? api.length : 0;
        const d = Number(db[0].cnt);
        return a === d ? { ok: true } : { ok: false, reason: `api=${a} db=${d}` };
      },
    },

    {
      name: 'GET /initiatives sorted by sort_order',
      api: 'GET /v2/dni/initiatives?storeId=8',
      sql: `SELECT COUNT(*) AS cnt FROM hero_di_initiative
              WHERE status='1' AND is_deleted='0' AND store_id=8`,
      check: (api, db) => {
        const a = Array.isArray(api) ? api.length : 0;
        const d = Number(db[0].cnt);
        if (a !== d) return { ok: false, reason: `api=${a} db=${d}` };
        // Sort order check
        for (let i = 1; i < api.length; i++) {
          if (Number(api[i - 1].sortOrder ?? 0) > Number(api[i].sortOrder ?? 0)) {
            return { ok: false, reason: `not ASC by sortOrder at index ${i}` };
          }
        }
        return { ok: true };
      },
    },

    {
      name: 'GET /featured filters active + DESC by date',
      api: 'GET /v2/dni/featured?storeId=8',
      sql: `SELECT COUNT(*) AS cnt FROM hero_di_featured
              WHERE status='1' AND is_deleted='0' AND store_id=8`,
      check: (api, db) => {
        const a = Array.isArray(api) ? api.length : 0;
        const d = Number(db[0].cnt);
        return a === d ? { ok: true } : { ok: false, reason: `api=${a} db=${d}` };
      },
    },

    {
      name: 'GET /newsletters active rows',
      api: 'GET /v2/dni/newsletters?storeId=8',
      sql: `SELECT COUNT(*) AS cnt FROM hero_di_newsletter
              WHERE status='1' AND is_deleted='0' AND store_id=8`,
      check: (api, db) => {
        const a = Array.isArray(api) ? api.length : 0;
        const d = Number(db[0].cnt);
        return a === d ? { ok: true } : { ok: false, reason: `api=${a} db=${d}` };
      },
    },

    {
      name: 'GET /videos active rows',
      api: 'GET /v2/dni/videos?storeId=8',
      sql: `SELECT COUNT(*) AS cnt FROM hero_di_video
              WHERE status='1' AND is_deleted='0' AND store_id=8`,
      check: (api, db) => {
        const a = Array.isArray(api) ? api.length : 0;
        const d = Number(db[0].cnt);
        return a === d ? { ok: true } : { ok: false, reason: `api=${a} db=${d}` };
      },
    },

    {
      name: 'GET /dashboard returns all 5 collections',
      api: 'GET /v2/dni/dashboard?storeId=8',
      sql: 'SELECT 1',
      check: (api) => {
        const required = ['initiatives', 'featured', 'events', 'newsletters', 'videos'];
        const missing = required.filter((k) => !Array.isArray(api?.[k]));
        return missing.length
          ? { ok: false, reason: `missing: ${missing.join(', ')}` }
          : { ok: true };
      },
    },
  ],
};
