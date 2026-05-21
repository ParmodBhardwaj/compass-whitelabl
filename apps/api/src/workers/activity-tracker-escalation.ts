/**
 * Activity Tracker — Email Escalation Worker
 *
 * Run this daily via PM2 cron or a system cron job:
 *   0 7 * * * tsx apps/api/src/workers/activity-tracker-escalation.ts
 *
 * Or via PM2:
 *   pm2 start ecosystem.config.js (see cron_restart entry)
 *
 * Escalation schedule (mirrors the legacy PHP cron):
 *   - 30 days BEFORE end_date: reminder to task owner + cc creator
 *   - ON end_date (if not completed): first escalation to owner's reporting manager
 *   - +7 days after end_date: second escalation
 *   - +15 days after end_date: third escalation to function head
 */

import 'reflect-metadata';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load env from project root
dotenv.config({ path: resolve(__dirname, '../../../../.env') });
dotenv.config({ path: resolve(__dirname, '../../.env') });

import { initDb, Op } from '@hero/db';
import {
  ActivityTrackerTasks,
  ActivityTrackerEmailEscalation,
  ActivityTrackerPrograms,
} from '@hero/db/src/models/generated';
import { initMail, sendMail } from '@hero/integrations/src/mail';

// ── Config ────────────────────────────────────────────────────────────────────

const DB_CONFIG = {
  host: process.env.DB_HOST ?? 'localhost',
  port: +(process.env.DB_PORT ?? 3306),
  database: process.env.DB_NAME ?? 'hero_compass',
  username: process.env.DB_USER ?? 'root',
  password: process.env.DB_PASS ?? '',
};

const MAIL_CONFIG = {
  host: process.env.MAIL_HOST ?? 'localhost',
  port: +(process.env.MAIL_PORT ?? 25),
  user: process.env.MAIL_USER,
  pass: process.env.MAIL_PASS,
  from: process.env.MAIL_FROM ?? 'noreply@example.com',
};

const BRAND_NAME = process.env.BRAND_NAME ?? 'Compass';

// ── Helpers ───────────────────────────────────────────────────────────────────

type EscalationTrigger = 'before_30' | 'on_cutoff' | 'after_7' | 'after_15';

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function toDateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

const TRIGGER_OFFSETS: Record<EscalationTrigger, number> = {
  before_30: 30,
  on_cutoff: 0,
  after_7: -7,
  after_15: -15,
};

const TRIGGER_SUBJECTS: Record<EscalationTrigger, string> = {
  before_30: 'Reminder: Activity Tracker task due in 30 days',
  on_cutoff: 'Action Required: Activity Tracker task due today',
  after_7: 'Overdue Notice: Activity Tracker task is 7 days past due',
  after_15: 'Escalation: Activity Tracker task is 15 days past due',
};

// ── Mail template ─────────────────────────────────────────────────────────────

function buildHtml(trigger: EscalationTrigger, task: any, program: any): string {
  const dueLabel = {
    before_30: 'is due in <strong>30 days</strong>',
    on_cutoff: 'is <strong>due TODAY</strong>',
    after_7: 'is <strong>7 days overdue</strong>',
    after_15: 'is <strong>15 days overdue</strong>',
  }[trigger];

  return `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
  <h2 style="background:#1ab394;color:#fff;padding:16px 20px;border-radius:4px 4px 0 0;margin:0">
    Activity Tracker — Action Required
  </h2>
  <div style="border:1px solid #e7eaec;border-top:none;padding:20px">
    <p>Dear Team,</p>
    <p>The following task ${dueLabel}:</p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0">
      <tr><td style="padding:8px;background:#f5f5f5;font-weight:bold;width:30%">Program</td>
          <td style="padding:8px;border-bottom:1px solid #eee">${program?.title ?? '—'}</td></tr>
      <tr><td style="padding:8px;background:#f5f5f5;font-weight:bold">Task</td>
          <td style="padding:8px;border-bottom:1px solid #eee">${task.title}</td></tr>
      ${task.code ? `<tr><td style="padding:8px;background:#f5f5f5;font-weight:bold">Code</td>
          <td style="padding:8px;border-bottom:1px solid #eee">${task.code}</td></tr>` : ''}
      <tr><td style="padding:8px;background:#f5f5f5;font-weight:bold">Start Date</td>
          <td style="padding:8px;border-bottom:1px solid #eee">${task.startDate}</td></tr>
      <tr><td style="padding:8px;background:#f5f5f5;font-weight:bold">End Date</td>
          <td style="padding:8px;border-bottom:1px solid #eee">${task.endDate}</td></tr>
      <tr><td style="padding:8px;background:#f5f5f5;font-weight:bold">Status</td>
          <td style="padding:8px;border-bottom:1px solid #eee">${task.status ?? 'open'}</td></tr>
    </table>
    ${task.shortDescription ? `<p style="color:#555">${task.shortDescription}</p>` : ''}
    <p>Please log in to <strong>${BRAND_NAME}</strong> to take the required action.</p>
    <p style="margin-top:24px;font-size:12px;color:#999">
      This is an automated notification from the ${BRAND_NAME} Activity Tracker.
    </p>
  </div>
</div>`;
}

// ── Core logic ────────────────────────────────────────────────────────────────

async function runEscalation(trigger: EscalationTrigger): Promise<void> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const targetDate = addDays(today, TRIGGER_OFFSETS[trigger]);
  const dateStr = toDateStr(targetDate);

  console.log(`[${trigger}] Querying tasks with end_date = ${dateStr}`);

  // Find tasks due on target date that are not completed/closed
  const tasks: any[] = await ActivityTrackerTasks.findAll({
    where: {
      isDeleted: '0',
      endDate: dateStr,
      status: { [Op.notIn]: ['completed', 'closed'] },
    } as any,
    raw: true,
  });

  if (!tasks.length) {
    console.log(`[${trigger}] No tasks found.`);
    return;
  }

  // Filter out stopped escalations
  const taskIds = tasks.map((t) => t.id);
  const stopped: any[] = await ActivityTrackerEmailEscalation.findAll({
    where: { taskId: { [Op.in]: taskIds }, isStopped: '1' } as any,
    raw: true,
  });
  const stoppedIds = new Set(stopped.map((s: any) => s.taskId));
  const dueTasks = tasks.filter((t: any) => !stoppedIds.has(t.id));

  console.log(`[${trigger}] ${dueTasks.length} task(s) require notification.`);

  // Load programs for all tasks
  const programIds = [...new Set(dueTasks.map((t: any) => t.programId).filter(Boolean))];
  let programMap = new Map<number, any>();
  if (programIds.length) {
    const programs: any[] = await ActivityTrackerPrograms.findAll({
      where: { id: { [Op.in]: programIds } } as any,
      raw: true,
    });
    programs.forEach((p: any) => programMap.set(p.id, p));
  }

  for (const task of dueTasks) {
    const program = programMap.get(task.programId);
    const subject = TRIGGER_SUBJECTS[trigger];
    const html = buildHtml(trigger, task, program);

    // Determine recipients
    // NOTE: In production, look up the employee email from the `employee` table using
    // task.currentOwner / task.createdBy user IDs. For now we use ccEmails as fallback.
    const recipients: string[] = [];
    if (task.ccEmails) {
      recipients.push(...task.ccEmails.split(',').map((e: string) => e.trim()).filter(Boolean));
    }

    if (!recipients.length) {
      console.warn(`[${trigger}] Task ${task.id} (${task.title}): no recipient emails found — skipping.`);
      continue;
    }

    try {
      await sendMail({ to: recipients, subject, html });
      console.log(`[${trigger}] Sent mail for task ${task.id} to: ${recipients.join(', ')}`);

      // Record sent
      const esc: any = await ActivityTrackerEmailEscalation.findOne({
        where: { taskId: task.id } as any,
      });
      if (esc) {
        await esc.update({
          isSent: '1',
          mailSentAt: toDateStr(today),
          mailCount: (esc.mailCount ?? 0) + 1,
          isTargetDatePassed: trigger !== 'before_30' ? '1' : esc.isTargetDatePassed,
        } as any);
      }
    } catch (err) {
      console.error(`[${trigger}] Failed to send mail for task ${task.id}:`, err);
    }
  }
}

// ── Entry point ───────────────────────────────────────────────────────────────

async function main() {
  console.log('Activity Tracker Escalation Worker starting…');
  initDb(DB_CONFIG);
  initMail(MAIL_CONFIG);

  const triggers: EscalationTrigger[] = ['before_30', 'on_cutoff', 'after_7', 'after_15'];
  for (const t of triggers) {
    try {
      await runEscalation(t);
    } catch (err) {
      console.error(`Escalation trigger "${t}" failed:`, err);
    }
  }
  console.log('Activity Tracker Escalation Worker done.');
  process.exit(0);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
