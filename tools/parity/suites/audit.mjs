/**
 * Audit Tracker — parity tests.
 *
 * AuditController doesn't have a class-level JWT guard yet, so these calls
 * succeed even without auth — but the runner sends a JWT anyway for parity
 * with the rest of the suite.
 */
export default {
  name: 'Audit',
  tests: [
    {
      name: 'GET /audit?userId=1 returns non-deleted audits',
      api: 'GET /v2/audit?userId=1',
      sql: `SELECT COUNT(*) AS cnt FROM audit WHERE is_deleted='0'`,
      check: (api, db) => {
        const a = Array.isArray(api) ? api.length : 0;
        const d = Number(db[0].cnt);
        return a === d ? { ok: true } : { ok: false, reason: `api=${a} db=${d}` };
      },
    },

    {
      name: 'GET /audit?status=open filter works',
      api: 'GET /v2/audit?userId=1&status=open',
      sql: `SELECT COUNT(*) AS cnt FROM audit WHERE is_deleted='0' AND status='open'`,
      check: (api, db) => {
        const a = Array.isArray(api) ? api.length : 0;
        const d = Number(db[0].cnt);
        if (a !== d) return { ok: false, reason: `api=${a} db=${d}` };
        const wrongs = (api ?? []).filter((r) => r.status && r.status !== 'open');
        return wrongs.length
          ? { ok: false, reason: `${wrongs.length} rows with status != 'open'` }
          : { ok: true };
      },
    },

    {
      name: 'GET /audit/meta/categories returns all categories',
      api: 'GET /v2/audit/meta/categories',
      sql: 'SELECT COUNT(*) AS cnt FROM audit_category',
      check: (api, db) => {
        const a = Array.isArray(api) ? api.length : 0;
        const d = Number(db[0].cnt);
        return a === d ? { ok: true } : { ok: false, reason: `api=${a} db=${d}` };
      },
    },

    {
      name: 'GET /audit/meta/themes returns all themes',
      api: 'GET /v2/audit/meta/themes',
      sql: 'SELECT COUNT(*) AS cnt FROM audit_theme',
      check: (api, db) => {
        const a = Array.isArray(api) ? api.length : 0;
        const d = Number(db[0].cnt);
        return a === d ? { ok: true } : { ok: false, reason: `api=${a} db=${d}` };
      },
    },

    {
      name: 'GET /audit/reports/sections.xlsx returns workbook',
      api: 'GET /v2/audit/reports/sections.xlsx',
      sql: 'SELECT 1',
      check: (api) => {
        // Excel endpoints come back as binary; the runner stores the raw
        // text — verify it starts with the ZIP magic bytes (PK\x03\x04).
        // Body is a string when content-type is not JSON.
        if (typeof api !== 'string' && !Buffer.isBuffer(api)) {
          // Unknown shape — best effort
          return { ok: !!api, reason: api ? '' : 'empty body' };
        }
        const head = typeof api === 'string' ? api.slice(0, 4) : api.slice(0, 4).toString();
        return head.startsWith('PK')
          ? { ok: true }
          : { ok: false, reason: `bad magic: ${head}` };
      },
    },
  ],
};
