import nodemailer, { Transporter } from 'nodemailer';

let transporter: Transporter | null = null;

export interface MailConfig {
  host: string;
  port: number;
  user?: string;
  pass?: string;
  from: string;
}

export function initMail(cfg: MailConfig) {
  transporter = nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    auth: cfg.user ? { user: cfg.user, pass: cfg.pass } : undefined,
  });
  (transporter as any)._heroFrom = cfg.from;
  return transporter;
}

export interface MailOptions {
  to: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  subject: string;
  html: string;
  text?: string;
}

export async function sendMail(opts: MailOptions) {
  if (!transporter) throw new Error('mail not initialized');
  return transporter.sendMail({ from: (transporter as any)._heroFrom, ...opts });
}
