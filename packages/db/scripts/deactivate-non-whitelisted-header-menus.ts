/**
 * One-off data fix: deactivate every top-level HEADER menu (position=0,
 * parent_id=0, store=1) EXCEPT the four whitelisted by name.
 *
 * Whitelist: Corporate, Portals, Policies, Videos
 *
 * Idempotent — safe to re-run. Prints affected rows + before/after state.
 *
 * Run:
 *   pnpm --filter @hero/db tsx scripts/deactivate-non-whitelisted-header-menus.ts
 *
 * or directly:
 *   cd packages/db && pnpm tsx scripts/deactivate-non-whitelisted-header-menus.ts
 */
import { config as loadEnv } from 'dotenv';
import { resolve } from 'node:path';
loadEnv({ path: resolve(__dirname, '../../../.env') });

import { initDb, getDb, QueryTypes } from '../src';

const WHITELIST = ['Corporate', 'Portals', 'Policies', 'Videos'];

async function main() {
  initDb({
    host: process.env.DB_HOST ?? '127.0.0.1',
    port: Number(process.env.DB_PORT ?? 3306),
    database: process.env.DB_NAME ?? 'phpherocompass',
    username: process.env.DB_USER ?? 'root',
    password: process.env.DB_PASSWORD ?? '',
  });
  const db = getDb();

  console.log('── Before ───────────────────────────────────────────');
  const before = (await db.query(
    `SELECT id, menu_name, active FROM menu
       WHERE position='0' AND store=1 AND parent_id=0
       ORDER BY ordering, id`,
    { type: QueryTypes.SELECT },
  )) as Array<{ id: number; menu_name: string; active: string }>;
  console.table(before);

  console.log('── Update ───────────────────────────────────────────');
  const [, affected] = await db.query(
    `UPDATE menu
        SET active = '0'
      WHERE position = '0'
        AND store = 1
        AND parent_id = 0
        AND menu_name NOT IN (:keep)
        AND active = '1'`,
    { replacements: { keep: WHITELIST } },
  );
  console.log(`Rows deactivated: ${affected ?? 0}`);

  console.log('── After ────────────────────────────────────────────');
  const after = (await db.query(
    `SELECT id, menu_name, active FROM menu
       WHERE position='0' AND store=1 AND parent_id=0
       ORDER BY ordering, id`,
    { type: QueryTypes.SELECT },
  )) as Array<{ id: number; menu_name: string; active: string }>;
  console.table(after);

  await db.close();
}

main().catch((e) => {
  console.error('FAILED:', e);
  process.exit(1);
});
