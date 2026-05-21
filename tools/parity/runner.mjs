#!/usr/bin/env node
/**
 * tools/parity/runner.mjs
 *
 * Parity test driver. For each registered suite, runs every test case:
 *   1. Mints a JWT for a designated test user (no real password flow).
 *   2. Hits the new API endpoint.
 *   3. Runs the corresponding SQL query against the same DB the legacy
 *      PHP app would have used.
 *   4. Hands both results to the suite's check function and records pass/fail.
 *
 * Prints a Markdown table per suite + JSON log to ./last-run.json.
 *
 * Usage:
 *   node tools/parity/runner.mjs                 # all suites
 *   node tools/parity/runner.mjs visitors        # one suite
 *   node tools/parity/runner.mjs --verbose       # verbose output
 *   node tools/parity/runner.mjs --user 42       # impersonate employee 42
 */

import { readdir, writeFile, readFile } from 'node:fs/promises';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createHmac } from 'node:crypto';

// Minimal .env loader (no external dep). Reads from the project root.
async function loadEnv() {
  try {
    const txt = await readFile(resolve(fileURLToPath(import.meta.url), '../../../.env'), 'utf8');
    for (const line of txt.split(/\r?\n/)) {
      const t = line.trim();
      if (!t || t.startsWith('#')) continue;
      const eq = t.indexOf('=');
      if (eq < 0) continue;
      const k = t.slice(0, eq).trim();
      let v = t.slice(eq + 1).trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        v = v.slice(1, -1);
      }
      if (!(k in process.env)) process.env[k] = v;
    }
  } catch {/* .env optional */}
}
await loadEnv();

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '../..');

// ── CLI arg parsing ──────────────────────────────────────────────────────

const argv = process.argv.slice(2);
const flags = new Set(argv.filter((a) => a.startsWith('--')));
const args = argv.filter((a) => !a.startsWith('--'));

let userOverride = null;
const userIdx = argv.indexOf('--user');
if (userIdx >= 0 && argv[userIdx + 1]) {
  userOverride = +argv[userIdx + 1];
  args.splice(args.indexOf(argv[userIdx + 1]), 1);
}

const VERBOSE = flags.has('--verbose') || flags.has('-v');

// ── Config ───────────────────────────────────────────────────────────────

const API_BASE = process.env.PARITY_API_BASE ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000';
const JWT_SECRET = process.env.JWT_ACCESS_SECRET ?? 'dev-only';
const TEST_USER_ID = userOverride ?? Number(process.env.PARITY_TEST_USER_ID ?? 1);
const TEST_USER_ROLES = (process.env.PARITY_TEST_USER_ROLES ?? '9').split(',').map(Number);

const DB = {
  host: process.env.DB_HOST ?? '127.0.0.1',
  port: +(process.env.DB_PORT ?? 3306),
  user: process.env.DB_USER ?? 'root',
  password: process.env.DB_PASSWORD ?? process.env.DB_PASS ?? '',
  database: process.env.DB_NAME ?? 'phpherocompass',
};

// ── JWT signer (HS256, no external dep) ──────────────────────────────────

function b64url(buf) {
  return Buffer.from(buf).toString('base64')
    .replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function signJwt(payload, secret) {
  // HS256 — matches @nestjs/jwt default for symmetric secret.
  const header = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = b64url(JSON.stringify(payload));
  const data = `${header}.${body}`;
  const sig = b64url(createHmac('sha256', secret).update(data).digest());
  return `${data}.${sig}`;
}

function mintToken() {
  const now = Math.floor(Date.now() / 1000);
  return signJwt({
    sub: TEST_USER_ID,
    email: 'parity-runner@hero.local',
    name: 'Parity Runner',
    roles: TEST_USER_ROLES,
    src: 'local',
    iat: now,
    exp: now + 60 * 60,
  }, JWT_SECRET);
}

// ── DB helper (uses workspace mysql2 install) ─────────────────────────────

async function loadMysql2() {
  const mysqlPath = resolve(ROOT, 'packages/db/node_modules/mysql2/promise.js');
  try {
    return await import(pathToFileURL(mysqlPath).href);
  } catch {
    return await import('mysql2/promise');
  }
}

let CONN = null;
async function db() {
  if (CONN) return CONN;
  const mysql = await loadMysql2();
  CONN = await mysql.createConnection(DB);
  return CONN;
}

async function sqlAll(sql, replacements = {}) {
  const c = await db();
  let final = sql;
  // Simple :name substitution — values are quoted.
  for (const [k, v] of Object.entries(replacements)) {
    final = final.replace(new RegExp(`:${k}\\b`, 'g'), c.escape(v));
  }
  const [rows] = await c.execute(final);
  return rows;
}

// ── API helper ───────────────────────────────────────────────────────────

const TOKEN = mintToken();

async function api(method, path, body) {
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`;
  const res = await fetch(url, {
    method,
    headers: {
      authorization: `Bearer ${TOKEN}`,
      'content-type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const ct = res.headers.get('content-type') ?? '';
  const data = ct.includes('json') ? await res.json().catch(() => null) : await res.text();
  return { status: res.status, data };
}

function parseApiSpec(spec) {
  // "GET /v2/foo?x=1" → { method, path }
  const idx = spec.indexOf(' ');
  return { method: spec.slice(0, idx).toUpperCase(), path: spec.slice(idx + 1).trim() };
}

// ── Suite loader ─────────────────────────────────────────────────────────

async function loadSuites(filterNames) {
  const dir = resolve(__dirname, 'suites');
  const files = (await readdir(dir)).filter((f) => f.endsWith('.mjs'));
  const suites = [];
  for (const f of files) {
    const mod = await import(pathToFileURL(join(dir, f)).href);
    const suite = mod.default;
    if (!suite?.name) continue;
    if (filterNames.length && !filterNames.some((fn) => suite.name.toLowerCase().includes(fn.toLowerCase()))) continue;
    suite._slug = f.replace(/\.mjs$/, '');
    suites.push(suite);
  }
  return suites;
}

// ── Run a single test ────────────────────────────────────────────────────

async function runTest(test) {
  const result = { name: test.name };
  if (test.skip) {
    result.ok = true;
    result.skipped = true;
    result.reason = test.skip;
    return result;
  }
  try {
    const { method, path } = parseApiSpec(test.api);
    const apiRes = await api(method, path, test.body);
    if (apiRes.status >= 400) {
      result.ok = false;
      result.reason = `API ${apiRes.status}: ${truncate(typeof apiRes.data === 'string' ? apiRes.data : JSON.stringify(apiRes.data), 160)}`;
      return result;
    }
    const dbRows = test.sql
      ? await sqlAll(test.sql, test.sqlParams ?? {})
      : null;
    const verdict = await test.check(apiRes.data, dbRows, { sqlAll });
    result.ok = !!verdict?.ok;
    if (!verdict?.ok) result.reason = verdict?.reason ?? 'check returned falsy';
    if (VERBOSE) {
      result.apiSample = truncate(JSON.stringify(apiRes.data), 200);
      result.dbSample = truncate(JSON.stringify(dbRows), 200);
    }
  } catch (err) {
    result.ok = false;
    result.reason = err?.message ?? String(err);
  }
  return result;
}

function truncate(s, n) {
  if (!s) return s;
  return s.length > n ? `${s.slice(0, n)}…` : s;
}

// ── Reporter ─────────────────────────────────────────────────────────────

function renderSuite(suite, results) {
  const pass = results.filter((r) => r.ok && !r.skipped).length;
  const skip = results.filter((r) => r.skipped).length;
  const fail = results.filter((r) => !r.ok).length;
  const total = results.length;
  const badge = fail === 0 ? '✅' : '❌';
  const skipNote = skip ? ` (${skip} skipped)` : '';
  console.log(`\n## ${badge} ${suite.name} — ${pass}/${total} passed${skipNote}\n`);
  console.log('| Test | Status | Reason |');
  console.log('|------|--------|--------|');
  for (const r of results) {
    const status = r.skipped ? '⏭️ skip' : r.ok ? '✅ pass' : '❌ fail';
    const reason = !r.ok || r.skipped ? truncate((r.reason ?? '').replace(/\|/g, '\\|'), 80) : '';
    console.log(`| ${r.name} | ${status} | ${reason} |`);
  }
  if (VERBOSE) {
    for (const r of results) {
      if (!r.apiSample) continue;
      console.log(`\n<details><summary>${r.name}</summary>\n`);
      console.log(`API: \`${r.apiSample}\`\nDB:  \`${r.dbSample}\``);
      console.log(`\n</details>`);
    }
  }
}

// ── Main ─────────────────────────────────────────────────────────────────

async function main() {
  // Sanity check
  console.log(`Parity runner — API=${API_BASE} user=${TEST_USER_ID} roles=[${TEST_USER_ROLES.join(',')}]`);
  if (JWT_SECRET === 'dev-only') {
    console.warn('⚠️  Using dev-only JWT secret. Set JWT_ACCESS_SECRET in env to match the API.');
  }

  const suites = await loadSuites(args);
  if (suites.length === 0) {
    console.error(`No suites matched ${JSON.stringify(args)}. Available:`);
    const all = await loadSuites([]);
    for (const s of all) console.error(`  - ${s.name} (${s._slug})`);
    process.exit(1);
  }

  const aggregate = { startedAt: new Date().toISOString(), suites: [] };
  let totalPass = 0;
  let totalFail = 0;

  for (const suite of suites) {
    const results = [];
    for (const test of suite.tests) {
      const r = await runTest(test);
      results.push(r);
      if (r.ok) totalPass++; else totalFail++;
    }
    renderSuite(suite, results);
    aggregate.suites.push({ name: suite.name, slug: suite._slug, results });
  }

  aggregate.totalPass = totalPass;
  aggregate.totalFail = totalFail;
  aggregate.finishedAt = new Date().toISOString();

  await writeFile(resolve(__dirname, 'last-run.json'), JSON.stringify(aggregate, null, 2));

  console.log(`\n────────────────────────────────────────`);
  console.log(`Total: ${totalPass + totalFail} | Pass: ${totalPass} | Fail: ${totalFail}`);
  console.log(`Log:  ${resolve(__dirname, 'last-run.json')}`);
  console.log(`────────────────────────────────────────`);

  if (CONN) await CONN.end();
  process.exit(totalFail === 0 ? 0 : 2);
}

main().catch((err) => {
  console.error('Runner crashed:', err);
  process.exit(1);
});
