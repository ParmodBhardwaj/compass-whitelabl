import * as soap from 'soap';

/** SAP SOAP client wrapper. WSDL + sandbox endpoint to be supplied by user. */
export interface SapConfig { wsdlUrl: string; username?: string; password?: string; }

let client: soap.Client | null = null;
let cfg: SapConfig | null = null;

export function initSap(c: SapConfig) { cfg = c; }

export async function getSapClient(): Promise<soap.Client> {
  if (client) return client;
  if (!cfg?.wsdlUrl) throw new Error('SAP not configured (set SAP_WSDL_URL)');
  client = await soap.createClientAsync(cfg.wsdlUrl);
  if (cfg.username) client.setSecurity(new soap.BasicAuthSecurity(cfg.username, cfg.password ?? ''));
  return client;
}

export async function callSap<T = any>(operation: string, args: object): Promise<T> {
  const c = await getSapClient();
  const fn = (c as any)[`${operation}Async`];
  if (!fn) throw new Error(`SAP operation not found: ${operation}`);
  const [result] = await fn(args);
  return result as T;
}
