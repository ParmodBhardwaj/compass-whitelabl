/**
 * Audit Tracker — Email Escalation Worker
 *
 * The riskiest cron workflow per the migration plan. Mirrors the legacy
 * `SAPIntegration/CronController::auditNotificationAction()` + auditEmailSend
 * job pair: every day at 07:00 walk every open audit_section, compute its
 * escalation bucket relative to `timeline`, and queue an email_notification
 * row addressed to the right recipients per the Hero matrix:
 *
 *   before_30  → Process Owner (PO) + Responsible Officer (RO)
 *   on_cutoff  → PO + RO + Function Head (FH)
 *   after_7    → PO + RO + FH + Department Head (DH)
 *   after_15   → PO + RO + FH + DH + Internal Audit (IA) team
 *
 * Recipient lookup:
 *   PO  = `audit_section.process_owner`   → employee.email
 *   RO  = `audit_section_processowner.user_id` rows (any type)
 *   FH/DH = employee.reporting_manager chain — best-effort one and two hops up
 *   IA  = `audit_internal_team.ecode` joined to employee
 *
 * Run daily via cron (07:00 IST recommended):
 *   0 7 * * *  tsx apps/api/src/workers/audit-tracker-escalation.ts
 *
 * Or via PM2:
 *   pm2 start ecosystem.config.js  (cron_restart entry: '0 7 * * *')
 */

import 'reflect-metadata';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load env from project root + apps/api fallback
dotenv.config({ path: resolve(__dirname, '../../../../.env') });
dotenv.config({ path: resolve(__dirname, '../../.env') });

import { initDb, Op, QueryTypes, getDb } from '@hero/db';
import {
  AuditSection,
  AuditSectionProcessowner,
  AuditInternalTeam,
  AuditEmailNotification,
  Audit,
} from '@hero/db/src/models/generated';
import { initMail, sendMail } from '@hero/integrations/src/mail';

// ── Config ────────────────────────────────────────────────────────────────────

const DB_CONFIG = {
  host: process.env.DB_HOST ?? 'localhost',
  port: +(process.env.DB_PORT ?? 3306),
  database: process.env.DB_NAME ?? 'phpherocompass',
  username: process.env.DB_USER ?? 'root',
  password: process.env.DB_PASS ?? process.env.DB_PASSWORD ?? '',
};

const MAIL_CONFIG = {
  host: process.env.MAIL_HOST ?? 'localhost',
  port: +(process.env.MAIL_PORT ?? 25),
  user: process.env.MAIL_USER,
  pass: process.env.MAIL_PASS,
  from: process.env.MAIL_FROM ?? 'noreply@herocompass.local',
};

// ── Constants ─────────────────────────────────────────────────────────────────

type Trigger = 'before_30' | 'on_cutoff' | 'after_7' | 'after_15';

const TRIGGER_OFFSETS: Record<Trigger, number> = {
  before_30: 30,
  on_cutoff: 0,
  after_7: -7,
  after_15: -15,
};

const TRIGGER_SUBJECTS: Record<Trigger, string> = {
  before_30: 'Reminder: Audit observation due in 30 days',
  on_cutoff: 'Action Required: Audit observation due today',
  after_7:   'Overdue Notice: Audit observation is 7 days past due',
  after_15:  'Escalation: Audit observation is 15 days past due',
};

/** Which roles get notified at each trigger. */
const RECIPIENT_MATRIX: Record<Trigger, ('PO' | 'RO' | 'FH' | 'DH' | 'IA')[]> = {
  before_30: ['PO', 'RO'],
  on_cutoff: ['PO', 'RO', 'FH'],
  after_7:   ['PO', 'RO', 'FH', 'DH'],
  after_15:  ['PO', 'RO', 'FH', 'DH', 'IA'],
};

const OPEN_STATUSES: (string | null)[] = [null, '', 'Not Implemented', 'Partially Implemented', 'In Progress'];

// ── Helpers ───────────────────────────────────────────────────────────────────

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}
function toDateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/**
 * Resolve an employee row by user_id (or ecode if a string slipped through).
 * Returns email + name + the manager's user_id (via ro_ecode → employee lookup).
 *
 * `employee.ro_ecode` is a string (the RO's ecode), not a user_id, so we
 * resolve it in a second query — null-safe.
 */
async function lookupEmployeeEmail(empId?: number | string | null): Promise<{ email?: string; name?: string; manager?: number | null }> {
  if (!empId) return {};
  const isNum = typeof empId === 'number' || /^\d+$/.test(String(empId));
  const rows = (await getDb().query(
    isNum
      ? `SELECT user_id, email, name, ro_ecode FROM employee WHERE user_id = :id LIMIT 1`
      : `SELECT user_id, email, name, ro_ecode FROM employee WHERE ecode = :id LIMIT 1`,
    { replacements: { id: empId }, type: QueryTypes.SELECT },
  )) as Array<{ user_id: number; email: string; name: string; ro_ecode: string | null }>;
  const r = rows[0];
  if (!r) return {};
  let managerUserId: number | null = null;
  if (r.ro_ecode) {
    const mgr = (await getDb().query(
      `SELECT user_id FROM employee WHERE ecode = :ec LIMIT 1`,
      { replacements: { ec: r.ro_ecode }, type: QueryTypes.SELECT },
    )) as Array<{ user_id: number }>;
    managerUserId = mgr[0]?.user_id ?? null;
  }
  return { email: r.email, name: r.name, manager: managerUserId };
}

async function emailsForRO(sectionId: number): Promise<string[]> {
  const rows = await AuditSectionProcessowner.findAll({
    where: { sectionId } as any,
    raw: true,
  }) as any[];
  const ids = rows.map((r) => r.userId).filter(Boolean);
  if (!ids.length) return [];
  const emails = (await getDb().query(
    `SELECT email FROM employee WHERE user_id IN (:ids) AND email IS NOT NULL AND email <> ''`,
    { replacements: { ids }, type: QueryTypes.SELECT },
  )) as Array<{ email: string }>;
  return emails.map((e) => e.email);
}

async function emailsForIA(): Promise<string[]> {
  const ia = await AuditInternalTeam.findAll({ raw: true }) as any[];
  const ecodes = ia.map((r) => r.ecode).filter(Boolean);
  if (!ecodes.length) return [];
  const emails = (await getDb().query(
    `SELECT email FROM employee WHERE ecode IN (:ec) AND email IS NOT NULL AND email <> ''`,
    { replacements: { ec: ecodes }, type: QueryTypes.SELECT },
  )) as Array<{ email: string }>;
  return emails.map((e) => e.email);
}

async function gatherRecipients(section: any, trigger: Trigger): Promise<string[]> {
  const roles = RECIPIENT_MATRIX[trigger];
  const out = new Set<string>();

  if (roles.includes('PO')) {
    const po = await lookupEmployeeEmail(section.processOwner);
    if (po.email) out.add(po.email);
  }
  if (roles.includes('RO')) {
    (await emailsForRO(section.id)).forEach((e) => out.add(e));
  }
  if (roles.includes('FH') || roles.includes('DH')) {
    // Walk the reporting chain off the PO. FH = 1 hop, DH = 2 hops up.
    const po = await lookupEmployeeEmail(section.processOwner);
    if (po.manager) {
      const fh = await lookupEmployeeEmail(po.manager);
      if (roles.includes('FH') && fh.email) out.add(fh.email);
      if (roles.includes('DH') && fh.manager) {
        const dh = await lookupEmployeeEmail(fh.manager);
        if (dh.email) out.add(dh.email);
      }
    }
  }
  if (roles.includes('IA')) {
    (await emailsForIA()).forEach((e) => out.add(e));
  }
  return [...out];
}

function buildHtml(trigger: Trigger, section: any, audit: any): string {
  const dueLabel = {
    before_30: 'is due in <strong>30 days</strong>',
    on_cutoff: 'is <strong>due TODAY</strong>',
    after_7:   'is <strong>7 days overdue</strong>',
    after_15:  'is <strong>15 days overdue</strong>',
  }[trigger];
  return `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
  <h2 style="background:#e2231a;color:#fff;padding:16px 20px;border-radius:4px 4px 0 0;margin:0">
    Audit Tracker — Action Required
  </h2>
  <div style="border:1px solid #e7eaec;border-top:none;padding:20px">
    <p>Dear Team,</p>
    <p>The following audit observation ${dueLabel}:</p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0">
      <tr><td style="padding:8px;background:#f5f5f5;font-weight:bold;width:30%">Audit</td>
          <td style="padding:8px;border-bottom:1px solid #eee">${audit?.title ?? audit?.auditName ?? '—'}</td></tr>
      <tr><td style="padding:8px;background:#f5f5f5;font-weight:bold">Section</td>
          <td style="padding:8px;border-bottom:1px solid #eee">${section.sectionName ?? '—'}</td></tr>
      <tr><td style="padding:8px;background:#f5f5f5;font-weight:bold">Observation</td>
          <td style="padding:8px;border-bottom:1px solid #eee">${(section.observationDetail ?? '').slice(0, 400)}</td></tr>
      <tr><td style="padding:8px;background:#f5f5f5;font-weight:bold">Risk Rating</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-transform:capitalize">${section.riskRating ?? '—'}</td></tr>
      <tr><td style="padding:8px;background:#f5f5f5;font-weight:bold">Cut-off Date</td>
          <td style="padding:8px;border-bottom:1px solid #eee">${section.timeline}</td></tr>
      <tr><td style="padding:8px;background:#f5f5f5;font-weight:bold">Status</td>
          <td style="padding:8px;border-bottom:1px solid #eee">${section.status ?? 'Open'}</td></tr>
    </table>
    <p>Please log in to <strong>Hero Compass — Audit Tracker</strong> to update progress.</p>
    <p style="margin-top:24px;font-size:12px;color:#999">
      This is an automated notification. Do not reply.
    </p>
  </div>
</div>`;
}

/**
 * Idempotent dispatch — checks `audit_email_notification` for an existing
 * (section_id, trigger_type) row before sending so the cron is safe to
 * re-run without spamming.
 */
async function alreadyNotified(sectionId: number, trigger: Trigger): Promise<boolean> {
  const row = await AuditEmailNotification.findOne({
    where: { sectionId, triggerType: trigger, isSend: '1' } as any,
  });
  return !!row;
}

async function recordNotification(args: {
  auditId?: number;
  sectionId: number;
  trigger: Trigger;
  recipients: string[];
  subject: string;
  body: string;
}) {
  await AuditEmailNotification.create({
    auditId: args.auditId ?? null,
    sectionId: args.sectionId,
    triggerType: args.trigger,
    emailTo: args.recipients.join(','),
    emailFrom: MAIL_CONFIG.from,
    cc: '',
    subject: args.subject,
    message: args.body,
    isSend: '1',
    date: toDateStr(new Date()),
    type: 'audit',
    createdAt: new Date(),
  } as any);
}

// ── Core loop ─────────────────────────────────────────────────────────────────

async function runEscalation(trigger: Trigger): Promise<{ sent: number; skipped: number }> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const targetDate = addDays(today, TRIGGER_OFFSETS[trigger]);
  const dateStr = toDateStr(targetDate);

  console.log(`[${trigger}] Looking for sections with timeline = ${dateStr}`);

  const sections: any[] = await AuditSection.findAll({
    where: {
      isDeleted: '0',
      timeline: dateStr,
      status: { [Op.or]: OPEN_STATUSES.map((s) => (s === null ? { [Op.is]: null } : s)) },
    } as any,
    raw: true,
  });

  if (!sections.length) {
    console.log(`[${trigger}] No sections require notification.`);
    return { sent: 0, skipped: 0 };
  }

  // Preload audit rows
  const auditIds = [...new Set(sections.map((s) => s.auditId).filter(Boolean))];
  const auditMap = new Map<number, any>();
  if (auditIds.length) {
    const audits = await Audit.findAll({ where: { id: { [Op.in]: auditIds } } as any, raw: true }) as any[];
    audits.forEach((a) => auditMap.set(a.id, a));
  }

  let sent = 0;
  let skipped = 0;

  for (const sec of sections) {
    if (await alreadyNotified(sec.id, trigger)) {
      skipped++;
      continue;
    }
    const recipients = await gatherRecipients(sec, trigger);
    if (!recipients.length) {
      console.warn(`[${trigger}] Section ${sec.id} has no resolvable recipients — skipping.`);
      skipped++;
      continue;
    }
    const audit = auditMap.get(sec.auditId);
    const subject = TRIGGER_SUBJECTS[trigger];
    const html = buildHtml(trigger, sec, audit);

    try {
      await sendMail({ to: recipients, subject, html });
      await recordNotification({
        auditId: sec.auditId,
        sectionId: sec.id,
        trigger,
        recipients,
        subject,
        body: html,
      });
      console.log(`[${trigger}] Section ${sec.id}: notified ${recipients.length} recipient(s).`);
      sent++;
    } catch (err) {
      console.error(`[${trigger}] Section ${sec.id}: send failed`, err);
      skipped++;
    }
  }
  return { sent, skipped };
}

// ── Entry point ───────────────────────────────────────────────────────────────

async function main() {
  console.log('Audit Tracker Escalation Worker starting…');
  initDb(DB_CONFIG);
  initMail(MAIL_CONFIG);

  const triggers: Trigger[] = ['before_30', 'on_cutoff', 'after_7', 'after_15'];
  const summary: Record<string, any> = {};
  for (const t of triggers) {
    try {
      summary[t] = await runEscalation(t);
    } catch (err) {
      console.error(`[${t}] Failed:`, err);
      summary[t] = { error: String(err) };
    }
  }
  console.log('Audit Tracker Escalation Worker done.', JSON.stringify(summary, null, 2));
  process.exit(0);
}

if (require.main === module) {
  main().catch((err) => { console.error('Fatal error:', err); process.exit(1); });
}
