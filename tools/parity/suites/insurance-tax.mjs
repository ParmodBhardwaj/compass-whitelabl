/**
 * Insurance + Tax — both share the `section` table by type column and the
 * same dashboard shape, so we lump them in one suite.
 */
export default {
  name: 'Insurance + Tax',
  tests: [
    // ── Insurance ────────────────────────────────────────────────────────
    // NOTE: insurance_documents / insurance_faqs / insurance_hyperlinks tables
    // do not exist in this database — the insurance schema was never seeded.
    // Skipping these tests until the tables are created or the module is
    // re-pointed at shared tables.
    {
      name: 'INS: /documents active rows',
      api: 'GET /v2/insurance/documents',
      sql: 'SELECT 1',
      skip: 'insurance_documents table missing from DB',
      check: () => ({ ok: true }),
    },
    {
      name: 'INS: /faqs active rows',
      api: 'GET /v2/insurance/faqs',
      sql: 'SELECT 1',
      skip: 'insurance_faqs table missing from DB',
      check: () => ({ ok: true }),
    },
    {
      name: 'INS: /hyperlinks active rows',
      api: 'GET /v2/insurance/hyperlinks',
      sql: 'SELECT 1',
      skip: 'insurance_hyperlinks table missing from DB',
      check: () => ({ ok: true }),
    },
    {
      name: 'INS: /sections filters type=insurance',
      api: 'GET /v2/insurance/sections',
      sql: `SELECT COUNT(*) AS cnt FROM section WHERE type='insurance' AND status='1' AND is_deleted='0'`,
      check: (api, db) => {
        const a = Array.isArray(api) ? api.length : 0;
        const d = Number(db[0].cnt);
        return a === d ? { ok: true } : { ok: false, reason: `api=${a} db=${d}` };
      },
    },
    {
      name: 'INS: /dashboard sections.length matches DB',
      api: 'GET /v2/insurance/dashboard',
      sql: 'SELECT 1',
      skip: 'depends on insurance_documents which is missing',
      check: () => ({ ok: true }),
    },

    // ── Tax ──────────────────────────────────────────────────────────────
    {
      name: 'TAX: /documents active rows',
      api: 'GET /v2/tax/documents',
      sql: `SELECT COUNT(*) AS cnt FROM tax_documents WHERE status='1' AND is_deleted='0'`,
      check: (api, db) => {
        const a = Array.isArray(api) ? api.length : 0;
        const d = Number(db[0].cnt);
        return a === d ? { ok: true } : { ok: false, reason: `api=${a} db=${d}` };
      },
    },
    {
      name: 'TAX: /faqs active rows',
      api: 'GET /v2/tax/faqs',
      sql: `SELECT COUNT(*) AS cnt FROM tax_faqs WHERE status='1' AND is_deleted='0'`,
      check: (api, db) => {
        const a = Array.isArray(api) ? api.length : 0;
        const d = Number(db[0].cnt);
        return a === d ? { ok: true } : { ok: false, reason: `api=${a} db=${d}` };
      },
    },
    {
      name: 'TAX: /sections filters type=tax',
      api: 'GET /v2/tax/sections',
      sql: `SELECT COUNT(*) AS cnt FROM section WHERE type='tax' AND status='1' AND is_deleted='0'`,
      check: (api, db) => {
        const a = Array.isArray(api) ? api.length : 0;
        const d = Number(db[0].cnt);
        return a === d ? { ok: true } : { ok: false, reason: `api=${a} db=${d}` };
      },
    },
    {
      name: 'TAX: /dashboard sections + faqs present',
      api: 'GET /v2/tax/dashboard',
      sql: `SELECT COUNT(*) AS cnt FROM section WHERE type='tax' AND status='1' AND is_deleted='0'`,
      check: (api, db) => {
        const a = Array.isArray(api?.sections) ? api.sections.length : 0;
        const d = Number(db[0].cnt);
        if (a !== d) return { ok: false, reason: `sections api=${a} db=${d}` };
        if (!Array.isArray(api?.faqs)) return { ok: false, reason: 'faqs missing' };
        return { ok: true };
      },
    },
  ],
};
