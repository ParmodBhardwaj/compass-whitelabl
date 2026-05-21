/**
 * SAP Integration — Token Refresh + Views Sync Worker
 *
 * Mirrors the legacy `SAPIntegration/CronController` jobs:
 *
 *   • rshrisToken     — refresh the SAP session token (legacy ran twice daily 05:01, 07:51).
 *                       Without a session token cached, subsequent SOAP calls fail.
 *   • viewsSynchCron  — pull employee / department / location views from SAP and
 *                       upsert them into the local mirror tables (legacy: 05:11, 06:21).
 *
 * Usage:
 *   tsx apps/api/src/workers/sap-sync.ts token
 *   tsx apps/api/src/workers/sap-sync.ts views
 *   tsx apps/api/src/workers/sap-sync.ts all       (default)
 *
 * Recommended cron (matches legacy schedule, IST):
 *   1 5,8 * * *   tsx apps/api/src/workers/sap-sync.ts token
 *   11 5,6 * * *  tsx apps/api/src/workers/sap-sync.ts views
 *
 * NOTE: Operation names below are placeholders. Once the SAP team provides
 * the actual WSDL operation names (Z_GET_EMPLOYEE, Z_GET_DEPARTMENT, etc.),
 * update `OPERATIONS` below. Until then, the worker logs every call but
 * won't actually mutate any rows — failures are swallowed so the cron stays
 * green in environments without SAP connectivity.
 */

import 'reflect-metadata';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '../../../../.env') });
dotenv.config({ path: resolve(__dirname, '../../.env') });

import { initDb, getDb, QueryTypes } from '@hero/db';
import { initSap, callSap } from '@hero/integrations/src/sap';

// ── Config ────────────────────────────────────────────────────────────────────

const DB_CONFIG = {
  host: process.env.DB_HOST ?? 'localhost',
  port: +(process.env.DB_PORT ?? 3306),
  database: process.env.DB_NAME ?? 'phpherocompass',
  username: process.env.DB_USER ?? 'root',
  password: process.env.DB_PASS ?? process.env.DB_PASSWORD ?? '',
};

const SAP_CONFIG = {
  wsdlUrl: process.env.SAP_WSDL_URL ?? '',
  username: process.env.SAP_USERNAME,
  password: process.env.SAP_PASSWORD,
};

/**
 * SOAP operation names. Replace with the actual operation names supplied by
 * the SAP team. Until then the worker only logs.
 */
const OPERATIONS = {
  refreshToken: process.env.SAP_OP_REFRESH_TOKEN ?? 'Z_REFRESH_TOKEN',
  getEmployees: process.env.SAP_OP_GET_EMPLOYEES ?? 'Z_GET_EMPLOYEE_VIEW',
  getDepartments: process.env.SAP_OP_GET_DEPARTMENTS ?? 'Z_GET_DEPARTMENT_VIEW',
  getLocations: process.env.SAP_OP_GET_LOCATIONS ?? 'Z_GET_LOCATION_VIEW',
};

// ── Token refresh ─────────────────────────────────────────────────────────────

/** Mirrors `rshrisToken` — kicks SAP to issue a new session token. */
async function refreshSapToken(): Promise<void> {
  if (!SAP_CONFIG.wsdlUrl) {
    console.warn('[sap-sync] SAP_WSDL_URL not set — token refresh skipped.');
    return;
  }
  try {
    const result = await callSap(OPERATIONS.refreshToken, {
      Username: SAP_CONFIG.username,
      Password: SAP_CONFIG.password,
    });
    console.log('[sap-sync] Token refresh OK:', summary(result));
    await logCronRun('rshrisToken', 'ok', null);
  } catch (err: any) {
    console.error('[sap-sync] Token refresh failed:', err?.message ?? err);
    await logCronRun('rshrisToken', 'error', err?.message);
  }
}

// ── Views sync ────────────────────────────────────────────────────────────────

/**
 * Mirrors `viewsSynchCron` — pulls employee/department/location views from
 * SAP and upserts them into the local mirror tables. Idempotent.
 */
async function syncViews(): Promise<void> {
  if (!SAP_CONFIG.wsdlUrl) {
    console.warn('[sap-sync] SAP_WSDL_URL not set — views sync skipped.');
    return;
  }
  await syncEmployeeView();
  await syncDepartmentView();
  await syncLocationView();
  await logCronRun('viewsSynchCron', 'ok', null);
}

async function syncEmployeeView(): Promise<void> {
  try {
    const result = (await callSap<{ Employees?: any[] }>(OPERATIONS.getEmployees, {})) ?? {};
    const rows = result.Employees ?? [];
    console.log(`[sap-sync] Employee view: ${rows.length} row(s) received.`);

    for (const r of rows) {
      // Upsert by ecode. Keep this list aligned with the actual SAP response.
      await getDb().query(
        `INSERT INTO employee (
            ecode, name, email, designation_name, department_name,
            mobile_no, dob, doj, profilepic, status, sap_last_sync
         ) VALUES (
            :ecode, :name, :email, :designation, :department,
            :mobile, :dob, :doj, NULL, '1', NOW()
         )
         ON DUPLICATE KEY UPDATE
            name = VALUES(name),
            email = VALUES(email),
            designation_name = VALUES(designation_name),
            department_name = VALUES(department_name),
            mobile_no = VALUES(mobile_no),
            dob = VALUES(dob),
            doj = VALUES(doj),
            sap_last_sync = NOW()`,
        {
          replacements: {
            ecode: r.ECode ?? r.ecode,
            name: r.Name ?? r.name ?? '',
            email: r.Email ?? r.email ?? null,
            designation: r.Designation ?? r.designation ?? '',
            department: r.Department ?? r.department ?? '',
            mobile: r.Mobile ?? r.mobile ?? null,
            dob: r.DOB ?? r.dob ?? null,
            doj: r.DOJ ?? r.doj ?? null,
          },
          type: QueryTypes.INSERT,
        },
      ).catch((err) => {
        console.error(`[sap-sync] Employee upsert failed for ${r.ECode ?? r.ecode}:`, err.message);
      });
    }
  } catch (err: any) {
    console.error('[sap-sync] Employee view sync failed:', err?.message ?? err);
  }
}

async function syncDepartmentView(): Promise<void> {
  try {
    const result = (await callSap<{ Departments?: any[] }>(OPERATIONS.getDepartments, {})) ?? {};
    const rows = result.Departments ?? [];
    console.log(`[sap-sync] Department view: ${rows.length} row(s) received.`);
    for (const r of rows) {
      await getDb().query(
        `INSERT INTO department (department_code, department_name)
         VALUES (:code, :name)
         ON DUPLICATE KEY UPDATE department_name = VALUES(department_name)`,
        {
          replacements: { code: r.Code ?? r.code, name: r.Name ?? r.name ?? '' },
          type: QueryTypes.INSERT,
        },
      ).catch(() => {});
    }
  } catch (err: any) {
    console.error('[sap-sync] Department view sync failed:', err?.message ?? err);
  }
}

async function syncLocationView(): Promise<void> {
  try {
    const result = (await callSap<{ Locations?: any[] }>(OPERATIONS.getLocations, {})) ?? {};
    const rows = result.Locations ?? [];
    console.log(`[sap-sync] Location view: ${rows.length} row(s) received.`);
    // Mirror table for locations (legacy `Location` entity → `location`).
    for (const r of rows) {
      await getDb().query(
        `INSERT INTO location (location_code, location_name)
         VALUES (:code, :name)
         ON DUPLICATE KEY UPDATE location_name = VALUES(location_name)`,
        {
          replacements: { code: r.Code ?? r.code, name: r.Name ?? r.name ?? '' },
          type: QueryTypes.INSERT,
        },
      ).catch(() => {});
    }
  } catch (err: any) {
    console.error('[sap-sync] Location view sync failed:', err?.message ?? err);
  }
}

// ── Cron audit trail ──────────────────────────────────────────────────────────

/**
 * Insert a row into `cron_run_log` so admins can see when each SAP job last
 * ran and whether it succeeded. Table is created lazily.
 */
async function logCronRun(job: string, status: 'ok' | 'error', message: string | null) {
  try {
    await getDb().query(
      `CREATE TABLE IF NOT EXISTS cron_run_log (
         id          INT PRIMARY KEY AUTO_INCREMENT,
         job_name    VARCHAR(64) NOT NULL,
         status      ENUM('ok','error') NOT NULL,
         message     TEXT,
         run_at      DATETIME NOT NULL,
         INDEX(job_name, run_at)
       )`,
      { type: QueryTypes.RAW },
    );
    await getDb().query(
      `INSERT INTO cron_run_log (job_name, status, message, run_at) VALUES (:job, :st, :msg, NOW())`,
      { replacements: { job, st: status, msg: message }, type: QueryTypes.INSERT },
    );
  } catch (err) {
    console.error('[sap-sync] cron_run_log write failed:', err);
  }
}

function summary(obj: any): string {
  if (!obj) return '(empty)';
  try { return JSON.stringify(obj).slice(0, 200); } catch { return String(obj).slice(0, 200); }
}

// ── Entry point ───────────────────────────────────────────────────────────────

async function main() {
  const job = process.argv[2] ?? 'all';
  console.log(`[sap-sync] Starting job=${job}`);

  initDb(DB_CONFIG);
  if (SAP_CONFIG.wsdlUrl) {
    initSap({
      wsdlUrl: SAP_CONFIG.wsdlUrl,
      username: SAP_CONFIG.username,
      password: SAP_CONFIG.password,
    });
  }

  switch (job) {
    case 'token': await refreshSapToken(); break;
    case 'views': await syncViews(); break;
    case 'all':
    default:
      await refreshSapToken();
      await syncViews();
  }
  console.log('[sap-sync] Done.');
  process.exit(0);
}

if (require.main === module) {
  main().catch((err) => { console.error('[sap-sync] Fatal:', err); process.exit(1); });
}
