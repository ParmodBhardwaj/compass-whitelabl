/**
 * Visitors module — parity tests.
 *
 * Each test hits a new API endpoint and compares to a SQL query that
 * mirrors what the legacy Doctrine repository would have returned.
 */
export default {
  name: 'Visitors',
  tests: [
    {
      name: 'GET /locations returns all rows',
      api: 'GET /v2/visitors/locations',
      sql: 'SELECT COUNT(*) AS cnt FROM visitor_locations',
      check: (apiRes, db) => {
        const apiCount = Array.isArray(apiRes) ? apiRes.length : 0;
        const dbCount = Number(db[0].cnt);
        return apiCount === dbCount
          ? { ok: true }
          : { ok: false, reason: `api=${apiCount} db=${dbCount}` };
      },
    },

    {
      name: 'GET /passes filters by status=1',
      api: 'GET /v2/visitors/passes',
      sql: `SELECT COUNT(*) AS cnt FROM visitor_pass WHERE status = '1'`,
      check: (apiRes, db) => {
        const apiCount = Array.isArray(apiRes) ? apiRes.length : 0;
        const dbCount = Number(db[0].cnt);
        return apiCount === dbCount
          ? { ok: true }
          : { ok: false, reason: `api=${apiCount} db=${dbCount}` };
      },
    },

    {
      name: 'GET /appointments?all=1 returns DESC by created_at',
      api: 'GET /v2/visitors/appointments?all=1',
      sql: `SELECT COUNT(*) AS cnt FROM visitor_appointment`,
      check: (apiRes, db) => {
        const dbCount = Number(db[0].cnt);
        const apiCount = Array.isArray(apiRes) ? apiRes.length : 0;
        if (apiCount !== dbCount) {
          return { ok: false, reason: `count mismatch api=${apiCount} db=${dbCount}` };
        }
        // Verify DESC ordering
        for (let i = 1; i < apiRes.length; i++) {
          const a = apiRes[i - 1]?.createdAt;
          const b = apiRes[i]?.createdAt;
          if (a && b && new Date(a) < new Date(b)) {
            return { ok: false, reason: `not DESC at index ${i}: ${a} < ${b}` };
          }
        }
        return { ok: true };
      },
    },

    {
      name: 'GET /stats matches DB rollup',
      api: 'GET /v2/visitors/stats',
      sql: `SELECT
              COUNT(*) AS total,
              SUM(request_status='pending')  AS pending,
              SUM(request_status='approved') AS approved,
              SUM(request_status='rejected') AS rejected
            FROM visitor_appointment`,
      check: (apiRes, db) => {
        const r = db[0];
        const mismatches = [];
        for (const k of ['total', 'pending', 'approved', 'rejected']) {
          if (Number(apiRes?.[k] ?? 0) !== Number(r[k] ?? 0)) {
            mismatches.push(`${k}: api=${apiRes?.[k]} db=${r[k]}`);
          }
        }
        return mismatches.length
          ? { ok: false, reason: mismatches.join(', ') }
          : { ok: true };
      },
    },

    {
      name: 'GET /appointments?status=pending applies filter',
      api: 'GET /v2/visitors/appointments?all=1&status=pending',
      sql: `SELECT COUNT(*) AS cnt FROM visitor_appointment WHERE request_status='pending'`,
      check: (apiRes, db) => {
        const apiCount = Array.isArray(apiRes) ? apiRes.length : 0;
        const dbCount = Number(db[0].cnt);
        if (apiCount !== dbCount) return { ok: false, reason: `api=${apiCount} db=${dbCount}` };
        // Every row should actually be 'pending'
        const wrongs = apiRes.filter((a) => a.requestStatus !== 'pending');
        return wrongs.length
          ? { ok: false, reason: `${wrongs.length} rows have requestStatus != 'pending'` }
          : { ok: true };
      },
    },

    {
      name: 'GET /batches returns all',
      api: 'GET /v2/visitors/batches',
      sql: 'SELECT COUNT(*) AS cnt FROM visitor_batches',
      check: (apiRes, db) => {
        const apiCount = Array.isArray(apiRes) ? apiRes.length : 0;
        const dbCount = Number(db[0].cnt);
        return apiCount === dbCount
          ? { ok: true }
          : { ok: false, reason: `api=${apiCount} db=${dbCount}` };
      },
    },
  ],
};
