/**
 * Idea Portal + Activity Tracker.
 * Idea uses /campaigns and /submissions endpoints.
 */
export default {
  name: 'Idea + ActivityTracker',
  tests: [
    // ── Idea Portal ──────────────────────────────────────────────────────
    {
      name: 'IDEA: /idea/submissions?all=1 count matches',
      api: 'GET /v2/idea/submissions?all=1',
      sql: 'SELECT COUNT(*) AS cnt FROM idea_submitted',
      check: (api, db) => {
        const a = Array.isArray(api) ? api.length : 0;
        const d = Number(db[0].cnt);
        return a === d ? { ok: true } : { ok: false, reason: `api=${a} db=${d}` };
      },
    },
    {
      name: 'IDEA: /idea/campaigns returns campaign table',
      api: 'GET /v2/idea/campaigns',
      sql: 'SELECT COUNT(*) AS cnt FROM idea_portal',
      check: (api, db) => {
        const a = Array.isArray(api) ? api.length : 0;
        const d = Number(db[0].cnt);
        return a === d ? { ok: true } : { ok: false, reason: `api=${a} db=${d}` };
      },
    },
    {
      name: 'IDEA: /idea/campaigns/active returns only active',
      api: 'GET /v2/idea/campaigns/active',
      sql: `SELECT COUNT(*) AS cnt FROM idea_portal WHERE status='1'`,
      check: (api, db) => {
        const a = Array.isArray(api) ? api.length : 0;
        const d = Number(db[0].cnt);
        return a === d ? { ok: true } : { ok: false, reason: `api=${a} db=${d}` };
      },
    },

    // ── Activity Tracker ─────────────────────────────────────────────────
    {
      name: 'ATR: /activity-tracker/tasks?all=1 active count',
      api: 'GET /v2/activity-tracker/tasks?all=1',
      sql: `SELECT COUNT(*) AS cnt FROM activity_tracker_tasks WHERE is_deleted='0'`,
      check: (api, db) => {
        const a = Array.isArray(api) ? api.length : 0;
        const d = Number(db[0].cnt);
        return a === d ? { ok: true } : { ok: false, reason: `api=${a} db=${d}` };
      },
    },
    {
      name: 'ATR: /activity-tracker/programs returns all',
      api: 'GET /v2/activity-tracker/programs',
      sql: `SELECT COUNT(*) AS cnt FROM activity_tracker_programs WHERE is_deleted='0'`,
      check: (api, db) => {
        const a = Array.isArray(api) ? api.length : 0;
        const d = Number(db[0].cnt);
        return a === d ? { ok: true } : { ok: false, reason: `api=${a} db=${d}` };
      },
    },
  ],
};
