/**
 * TPM module — parity tests.
 * Endpoints: /v2/tpm/hazard (singular), /v2/tpm/opl, /v2/tpm/meta/*
 */
export default {
  name: 'TPM',
  tests: [
    {
      name: 'GET /tpm/hazard?all=1 count matches DB',
      api: 'GET /v2/tpm/hazard?all=1',
      sql: `SELECT COUNT(*) AS cnt FROM hazard_request WHERE is_deleted='0'`,
      check: (api, db) => {
        const a = Array.isArray(api) ? api.length : 0;
        const d = Number(db[0].cnt);
        return a === d ? { ok: true } : { ok: false, reason: `api=${a} db=${d}` };
      },
    },

    {
      name: 'GET /tpm/opl?all=1 count matches DB',
      api: 'GET /v2/tpm/opl?all=1',
      sql: `SELECT COUNT(*) AS cnt FROM opl_request WHERE is_deleted='0'`,
      check: (api, db) => {
        const a = Array.isArray(api) ? api.length : 0;
        const d = Number(db[0].cnt);
        return a === d ? { ok: true } : { ok: false, reason: `api=${a} db=${d}` };
      },
    },

    {
      name: 'GET /tpm/meta/hazard-categories returns category table',
      api: 'GET /v2/tpm/meta/hazard-categories',
      sql: 'SELECT COUNT(*) AS cnt FROM hazard_category',
      check: (api, db) => {
        const a = Array.isArray(api) ? api.length : 0;
        const d = Number(db[0].cnt);
        return a === d ? { ok: true } : { ok: false, reason: `api=${a} db=${d}` };
      },
    },

    {
      name: 'GET /tpm/meta/hazard-sub-categories returns sub-category table',
      api: 'GET /v2/tpm/meta/hazard-sub-categories',
      sql: 'SELECT COUNT(*) AS cnt FROM hazard_sub_category',
      check: (api, db) => {
        const a = Array.isArray(api) ? api.length : 0;
        const d = Number(db[0].cnt);
        return a === d ? { ok: true } : { ok: false, reason: `api=${a} db=${d}` };
      },
    },

    {
      name: 'GET /tpm/meta/plants returns plants table',
      api: 'GET /v2/tpm/meta/plants',
      sql: 'SELECT COUNT(*) AS cnt FROM tpm_master_plant',
      check: (api, db) => {
        const a = Array.isArray(api) ? api.length : 0;
        const d = Number(db[0].cnt);
        return a === d ? { ok: true } : { ok: false, reason: `api=${a} db=${d}` };
      },
    },
  ],
};
