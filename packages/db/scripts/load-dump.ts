/**
 * Load DatabaseDump.sql into the configured MySQL database.
 *
 * - Creates the database if it doesn't exist.
 * - Runs the dump via `multipleStatements: true`.
 *
 * Run: pnpm --filter @hero/db load-dump
 */
import { config as loadEnv } from 'dotenv';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import mysql from 'mysql2/promise';

loadEnv({ path: resolve(__dirname, '../../../.env') });

async function main() {
  const cfg = {
    host: process.env.DB_HOST ?? '127.0.0.1',
    port: Number(process.env.DB_PORT ?? 3306),
    database: process.env.DB_NAME ?? 'heronewlanding',
    user: process.env.DB_USER ?? 'root',
    password: process.env.DB_PASSWORD ?? '',
  };
  const dumpPath = resolve(__dirname, '../../../../DatabaseDump.sql');
  console.log(`Reading dump: ${dumpPath}`);
  const sql = readFileSync(dumpPath, 'utf8');
  console.log(`Dump size: ${(sql.length / 1024).toFixed(1)} KB`);

  console.log(`Connecting to mysql://${cfg.user}@${cfg.host}:${cfg.port} ...`);
  const root = await mysql.createConnection({
    host: cfg.host,
    port: cfg.port,
    user: cfg.user,
    password: cfg.password,
    multipleStatements: true,
  });
  await root.query(`CREATE DATABASE IF NOT EXISTS \`${cfg.database}\` DEFAULT CHARSET utf8mb4`);
  await root.changeUser({ database: cfg.database });
  console.log(`Loading into ${cfg.database} ...`);
  await root.query(sql);
  console.log('Done.');
  await root.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
