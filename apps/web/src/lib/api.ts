/**
 * Server-side fetch helper for /v2 API. In dev, Next rewrites /api/v2 → API.
 * On the server, hit the API directly.
 */
const API_BASE = process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000';

export interface ApiRequestOptions extends RequestInit {
  token?: string;
}

export async function api<T>(path: string, opts: ApiRequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    'content-type': 'application/json',
    ...(opts.headers as Record<string, string> | undefined),
  };
  if (opts.token) headers.authorization = `Bearer ${opts.token}`;
  const res = await fetch(`${API_BASE}/v2${path}`, { ...opts, headers, cache: 'no-store' });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`API ${path} failed: ${res.status} ${text}`);
  }
  return res.json() as Promise<T>;
}

// ---- shared types ----
export interface Banner { id: number; title?: string; image?: string; url?: string; sortOrder?: number; }
export interface NewsItem { id: number; title?: string; alias?: string; shortDescription?: string; description?: string; image?: string; newsDate?: string; newsType?: string; isFeatured?: '0' | '1'; status?: '0' | '1'; }
export interface Gallery { id: number; title?: string; alias?: string; category?: number; status?: '0' | '1'; coverImage?: string | null; imageCount?: number; }
export interface GalleryImage { id: number; title?: string; galleryId: number; image?: string; thumbnail?: string; isFeatured?: '0' | '1'; }
export interface CmsPage { id: number; title?: string; alias?: string; shortDescription?: string; description?: string; status?: '0' | '1'; }
export interface MenuItem { id: number; menuName: string; url?: string; position: '0' | '1' | '2'; ordering: number; parentId: number; active: '0' | '1'; }
export interface Policy { id: number; title?: string; alias?: string; isPublic?: '0' | '1'; status?: '0' | '1'; }
export interface Employee { userId: number; ecode?: string; name?: string; email?: string; department?: number; location?: number; designation?: string; grade?: string; profilepic?: string; }
