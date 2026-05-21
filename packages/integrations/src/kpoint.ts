import axios from 'axios';

/** kPoint video platform — embed and metadata fetch. Endpoint TBD. */
export interface KpointConfig { baseUrl: string; apiKey?: string; }

let cfg: KpointConfig | null = null;
export function initKpoint(c: KpointConfig) { cfg = c; }

export async function getKpointVideoMeta(videoId: string) {
  if (!cfg) throw new Error('kpoint not initialized');
  const { data } = await axios.get(`${cfg.baseUrl}/videos/${videoId}`, {
    headers: cfg.apiKey ? { Authorization: `Bearer ${cfg.apiKey}` } : {},
  });
  return data;
}
