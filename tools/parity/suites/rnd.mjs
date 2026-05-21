/**
 * RnD module — parity tests.
 */
export default {
  name: 'RnD',
  tests: [
    {
      name: 'GET /notices returns active rows',
      api: 'GET /v2/rnd/notices',
      sql: `SELECT COUNT(*) AS cnt FROM hero_rnd_notice_board WHERE status='1'`,
      check: (api, db) => {
        const a = Array.isArray(api) ? api.length : 0;
        const d = Number(db[0].cnt);
        return a === d ? { ok: true } : { ok: false, reason: `api=${a} db=${d}` };
      },
    },

    {
      name: 'GET /joinees?storeId=19 filters by store + status',
      api: 'GET /v2/rnd/joinees?storeId=19',
      sql: `SELECT COUNT(*) AS cnt FROM hero_rnd_joinees WHERE status='1' AND store_id=19`,
      check: (api, db) => {
        const a = Array.isArray(api) ? api.length : 0;
        const d = Number(db[0].cnt);
        return a === d ? { ok: true } : { ok: false, reason: `api=${a} db=${d}` };
      },
    },

    {
      name: 'GET /competitor-products filters by status=1',
      api: 'GET /v2/rnd/competitor-products',
      sql: `SELECT COUNT(*) AS cnt FROM hero_rnd_competitor_product WHERE status='1'`,
      check: (api, db) => {
        const a = Array.isArray(api) ? api.length : 0;
        const d = Number(db[0].cnt);
        return a === d ? { ok: true } : { ok: false, reason: `api=${a} db=${d}` };
      },
    },

    {
      name: 'GET /ceo-message returns Message row id=2',
      api: 'GET /v2/rnd/ceo-message',
      sql: `SELECT id, title FROM message WHERE id=2`,
      check: (api, db) => {
        if (!db.length) return { ok: true, reason: 'no db row (skipped)' };
        if (!api || api.id !== 2) {
          return { ok: false, reason: `api.id=${api?.id} expected 2` };
        }
        return { ok: true };
      },
    },

    {
      name: 'GET /overview returns Message row id=3',
      api: 'GET /v2/rnd/overview',
      sql: `SELECT id FROM message WHERE id=3`,
      check: (api, db) => {
        if (!db.length) return { ok: true };
        return api?.id === 3
          ? { ok: true }
          : { ok: false, reason: `api.id=${api?.id} expected 3` };
      },
    },

    {
      name: 'GET /dashboard aggregates all sections',
      api: 'GET /v2/rnd/dashboard?storeId=6',
      sql: 'SELECT 1',
      check: (api) => {
        const required = ['notice', 'joinees', 'products', 'ceoMessage', 'overview', 'news', 'birthdays'];
        const missing = required.filter((k) => !(k in (api ?? {})));
        return missing.length
          ? { ok: false, reason: `missing keys: ${missing.join(', ')}` }
          : { ok: true };
      },
    },
  ],
};
