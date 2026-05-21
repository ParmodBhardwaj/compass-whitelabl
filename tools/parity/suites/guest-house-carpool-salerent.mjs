/**
 * Guest House + Car Pool + Sale/Rent.
 * Endpoint paths: /guest-house/{houses,bookings}, /carpool/{offers,locations}, /sale-rent/{listings,categories}
 */
export default {
  name: 'GuestHouse + CarPool + Sale/Rent',
  tests: [
    // ── Guest House ──────────────────────────────────────────────────────
    {
      name: 'GH: /guest-house/houses returns active houses',
      api: 'GET /v2/guest-house/houses',
      sql: `SELECT COUNT(*) AS cnt FROM hero_guest_house WHERE status='1'`,
      check: (api, db) => {
        const a = Array.isArray(api) ? api.length : 0;
        const d = Number(db[0].cnt);
        return a === d ? { ok: true } : { ok: false, reason: `api=${a} db=${d}` };
      },
    },
    {
      name: 'GH: /guest-house/bookings?all=1 count matches',
      api: 'GET /v2/guest-house/bookings?all=1',
      sql: 'SELECT COUNT(*) AS cnt FROM hero_guest_booking',
      check: (api, db) => {
        const a = Array.isArray(api) ? api.length : 0;
        const d = Number(db[0].cnt);
        return a === d ? { ok: true } : { ok: false, reason: `api=${a} db=${d}` };
      },
    },

    // ── Car Pool ─────────────────────────────────────────────────────────
    {
      name: 'CP: /carpool/offers?all=1 count matches',
      api: 'GET /v2/carpool/offers?all=1',
      sql: 'SELECT COUNT(*) AS cnt FROM cp_ride_offers',
      check: (api, db) => {
        const a = Array.isArray(api) ? api.length : 0;
        const d = Number(db[0].cnt);
        return a === d ? { ok: true } : { ok: false, reason: `api=${a} db=${d}` };
      },
    },
    {
      name: 'CP: /carpool/locations returns all',
      api: 'GET /v2/carpool/locations',
      sql: 'SELECT COUNT(*) AS cnt FROM cp_office_locations',
      check: (api, db) => {
        const a = Array.isArray(api) ? api.length : 0;
        const d = Number(db[0].cnt);
        return a === d ? { ok: true } : { ok: false, reason: `api=${a} db=${d}` };
      },
    },

    // ── Sale / Rent ──────────────────────────────────────────────────────
    {
      name: 'SR: /sale-rent/listings?all=1 active listings',
      api: 'GET /v2/sale-rent/listings?all=1',
      sql: 'SELECT COUNT(*) AS cnt FROM sale',
      check: (api, db) => {
        const a = Array.isArray(api) ? api.length : 0;
        const d = Number(db[0].cnt);
        return a === d ? { ok: true } : { ok: false, reason: `api=${a} db=${d}` };
      },
    },
    {
      name: 'SR: /sale-rent/categories returns sale categories',
      api: 'GET /v2/sale-rent/categories',
      sql: 'SELECT COUNT(*) AS cnt FROM hero_sale_category',
      check: (api, db) => {
        const a = Array.isArray(api) ? api.length : 0;
        const d = Number(db[0].cnt);
        return a === d ? { ok: true } : { ok: false, reason: `api=${a} db=${d}` };
      },
    },
  ],
};
