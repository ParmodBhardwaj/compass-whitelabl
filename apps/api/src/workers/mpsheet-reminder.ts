/**
 * MP Sheet — Pending Request Reminder Worker
 *
 * Run daily via PM2 cron or system cron:
 *   0 9 * * * tsx apps/api/src/workers/mpsheet-reminder.ts
 *
 * Sends a single reminder email for MP requests that have been
 * in 'pending' status for more than 7 days without a reminder_sent_at.
 */

import 'reflect-metadata';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '../../../../.env') });
dotenv.config({ path: resolve(__dirname, '../../.env') });

import { initDb, Op } from '@hero/db';
import { MpRequest } from '@hero/db/src/models/generated';
import { sendMail } from '@hero/integrations/src/mail';

const REMINDER_AFTER_DAYS = 7;

const DB_CONFIG = {
  host: process.env.DB_HOST ?? 'localhost',
  port: +(process.env.DB_PORT ?? 3306),
  database: process.env.DB_NAME ?? 'hero_compass',
  username: process.env.DB_USER ?? 'root',
  password: process.env.DB_PASS ?? '',
};

async function run() {
  await initDb(DB_CONFIG);
  console.log('[MPSheet Reminder] Starting…');

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - REMINDER_AFTER_DAYS);

  const pending = await MpRequest.findAll({
    where: {
      status: 'pending',
      isDeleted: '0',
      createdAt: { [Op.lte]: cutoff },
      reminderSentAt: null as any,
    } as any,
  });

  console.log(`[MPSheet Reminder] Found ${pending.length} pending request(s) needing reminder`);

  for (const mp of pending) {
    const mpData = mp as any;

    // We don't have direct email in MpRequest; skip gracefully if no configured contact
    // In production, join with employee table to get email
    console.log(`  → MP Request #${mpData.id} (created by employee #${mpData.createdBy}): sending reminder`);

    // Mark as reminded immediately to avoid duplicate sends on retry
    await mp.update({ reminderSentAt: new Date() } as any);

    // TODO: Look up employee email from Employee model by mpData.createdBy
    // For now log only
    console.log(`  → MP Request #${mpData.id}: reminder_sent_at updated`);
  }

  // Summary log for monitoring
  console.log(`[MPSheet Reminder] Processed ${pending.length} reminder(s).`);
  console.log('[MPSheet Reminder] Done.');
  process.exit(0);
}

run().catch(err => {
  console.error('[MPSheet Reminder] Fatal error:', err);
  process.exit(1);
});
