'use client';

/**
 * Tiny client-side session helper. Stores JWT access + refresh tokens in
 * sessionStorage (cleared when the tab closes). For SSO/Google flows the
 * callback page should call `setTokens()` after exchanging the code.
 */

export interface Session {
  accessToken: string;
  refreshToken?: string;
}

const ACCESS = 'accessToken';
const REFRESH = 'refreshToken';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(ACCESS);
}

export function setTokens(s: Session) {
  sessionStorage.setItem(ACCESS, s.accessToken);
  if (s.refreshToken) sessionStorage.setItem(REFRESH, s.refreshToken);
}

export function clearTokens() {
  sessionStorage.removeItem(ACCESS);
  sessionStorage.removeItem(REFRESH);
}

export async function refresh(): Promise<string | null> {
  const r = sessionStorage.getItem(REFRESH);
  if (!r) return null;
  const res = await fetch('/api/v2/auth/refresh', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ refreshToken: r }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
  return data.accessToken;
}

/** Client-side wrapper that adds the bearer token automatically. */
export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'content-type': 'application/json',
    ...(init.headers as Record<string, string> | undefined),
  };
  if (token) headers.authorization = `Bearer ${token}`;
  let res = await fetch(`/api/v2${path}`, { ...init, headers });
  if (res.status === 401) {
    const fresh = await refresh();
    if (fresh) {
      headers.authorization = `Bearer ${fresh}`;
      res = await fetch(`/api/v2${path}`, { ...init, headers });
    } else {
      window.location.href = '/login';
      throw new Error('unauthorized');
    }
  }
  if (!res.ok) throw new Error(`${path} failed: ${res.status}`);
  return res.json() as Promise<T>;
}
