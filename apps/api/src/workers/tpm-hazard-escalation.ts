/**
 * TPM Hazard — Email Escalation Worker
 *
 * Run daily via PM2 cron or system cron:
 *   0 8 * * * tsx apps/api/src/workers/tpm-hazard-escalation.ts
 *
 * Escalation schedule (mirrors legacy PHP behavior):
 *   - 3 days overdue   → reminder to assigned corrector
 *   - 7 days overdue   → escalate to section head
 *   - 28 days overdue  → escalate to plant head
 */

import 'reflect-metadata';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '../../../../.env') });
dotenv.config({ path: resolve(__dirname, '../../.env') });

import { initDb, Op } from '@hero/db';
import { HazardRequest, TpmEscalation } from '@hero/db/src/models/generated';
import { sendMail } from '@hero/integrations/src/mail';

const BRAND_NAME = process.env.BRAND_NAME ?? 'Compass';

const DB_CONFIG = {
  host: process.env.DB_HOST ?? 'localhost',
  port: +(process.env.DB_PORT ?? 3306),
  database: process.env.DB_NAME ?? 'hero_compass',
  username: process.env.DB_USER ?? 'root',
  password: process.env.DB_PASS ?? '',
};

async function run() {
  await initDb(DB_CONFIG);
  console.log('[TPM Escalation] Starting…');

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const thresholds = [
    { days: 3, label: '3 days overdue', escalateTo: 'corrector' },
    { days: 7, label: '7 days overdue', escalateTo: 'section_head' },
    { days: 28, label: '28 days overdue', escalateTo: 'plant_head' },
  ];

  for (const { days, label, escalateTo } of thresholds) {
    const cutoff = new Date(today);
    cutoff.setDate(cutoff.getDate() - days);
    const cutoffStr = cutoff.toISOString().slice(0, 10);

    const where: any = {
      endDate: cutoffStr,
      isDeleted: '0',
      status: { [Op.notIn]: ['closed', 'resolved'] },
    };

    const hazards = await HazardRequest.findAll({ where });
    console.log(`[TPM Escalation] ${label}: found ${hazards.length} hazard(s)`);

    for (const h of hazards) {
      const hazardData = h as any;
      // HazardRequest has no direct email column; in production join with Employee model
      // For now derive from assignedTo/currentlyAssign IDs (logged for manual follow-up)
      const targetEmail = (process.env.ESCALATION_FALLBACK_EMAIL ?? '');
      const assigneeId = hazardData.currentlyAssign ?? hazardData.assignedTo;

      if (!targetEmail) {
        console.log(`  → Hazard #${hazardData.id}: no fallback email configured, logging only (assignee ID: ${assigneeId})`);
        continue;
      }

      try {
        await sendMail({
          to: targetEmail,
          subject: `[TPM Hazard Alert] Hazard #${hazardData.id} is ${label}`,
          html: `
            <p>Dear Team,</p>
            <p>This is an automated reminder that the following TPM hazard is <strong>${label}</strong>:</p>
            <table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse;font-family:sans-serif;font-size:13px;">
              <tr><th>Field</th><th>Value</th></tr>
              <tr><td>Hazard ID</td><td>${hazardData.id}</td></tr>
              <tr><td>Description</td><td>${String(hazardData.description ?? '').slice(0, 200)}</td></tr>
              <tr><td>End Date</td><td>${hazardData.endDate}</td></tr>
              <tr><td>Risk Level</td><td>${hazardData.riskLevel ?? '—'}</td></tr>
              <tr><td>Status</td><td>${hazardData.status}</td></tr>
              <tr><td>Assigned To (ID)</td><td>${assigneeId ?? '—'}</td></tr>
              <tr><td>Escalation Level</td><td>${escalateTo.replace('_', ' ')}</td></tr>
            </table>
            <p>Please take immediate action to resolve this hazard.</p>
            <p style="color:#888;font-size:11px;">This is an automated message from ${BRAND_NAME}.</p>
          `,
        });
        console.log(`  → Hazard #${hazardData.id}: email sent to ${targetEmail} (${escalateTo})`);
      } catch (err) {
        console.error(`  → Hazard #${hazardData.id}: email failed`, err);
      }
    }
  }

  console.log('[TPM Escalation] Done.');
  process.exit(0);
}

run().catch(err => {
  console.error('[TPM Escalation] Fatal error:', err);
  process.exit(1);
});
