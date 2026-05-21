# Parity Test Suite

End-to-end tests that compare the **new NestJS API** responses to the **legacy
PHP application's expected behavior**. Each test case declares:

- A REST endpoint on the new system (e.g. `GET /v2/visitors/appointments?contactPerson=42`)
- A direct SQL query that produces the legacy-equivalent result
- An assertion function that compares the two

Because the legacy PHP server isn't running side-by-side in this environment,
the SQL query stands in for "what legacy would have returned" — both systems
share the same MySQL schema, so a Doctrine repository's `findBy(...)` is
trivially expressible as raw SQL. For shape parity this is reliable. For
exotic behavior (HTML rendering quirks, mPDF output, etc.) you'd want a live
legacy server.

## Run

```bash
# Default — runs every suite under tools/parity/suites/*.mjs
node tools/parity/runner.mjs

# A single suite
node tools/parity/runner.mjs visitors

# Multiple
node tools/parity/runner.mjs visitors training rnd

# Verbose — prints each request + diff
node tools/parity/runner.mjs --verbose
```

## Requirements

- API server running on `http://localhost:4000` (or override `API_BASE_URL`)
- MySQL reachable at the credentials in `.env`
- `JWT_ACCESS_SECRET` env var matching what the API uses (so the runner can
  mint its own JWT — it does NOT hit the login endpoint or use real credentials)

## Reports

The runner prints a per-suite Markdown table to stdout and writes a JSON log
to `tools/parity/last-run.json` for diffing across runs.

## Adding a new suite

Create `tools/parity/suites/<module>.mjs` exporting a default `{ name, tests }`:

```js
export default {
  name: 'My Module',
  tests: [
    {
      name: 'list returns same count as DB',
      api: 'GET /v2/my-module/items?status=active',
      sql: `SELECT COUNT(*) AS cnt FROM my_items WHERE status='active' AND is_deleted='0'`,
      check: (apiResult, dbRows) => {
        const expected = Number(dbRows[0].cnt);
        const actual = Array.isArray(apiResult) ? apiResult.length : 0;
        return actual === expected
          ? { ok: true }
          : { ok: false, reason: `expected ${expected}, got ${actual}` };
      },
    },
  ],
};
```
