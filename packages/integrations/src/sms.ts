import axios from 'axios';

export interface SmsConfig { apiUrl: string; apiKey: string; }

let cfg: SmsConfig | null = null;
export function initSms(c: SmsConfig) { cfg = c; }

export async function sendSms(to: string, message: string) {
  if (!cfg) throw new Error('sms not initialized');
  return axios.post(cfg.apiUrl, { to, message }, { headers: { Authorization: `Bearer ${cfg.apiKey}` } });
}
