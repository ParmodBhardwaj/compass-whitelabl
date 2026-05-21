/**
 * Resolves legacy asset URLs.
 *
 * In dev the Next.js proxy (/files/*) may point to localhost:8080 if the
 * server hasn't been restarted after env changes, so we hit the legacy server
 * directly. The NEXT_PUBLIC_LEGACY_URL env var lets you override in production.
 */
export const LEGACY_BASE =
  (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_LEGACY_URL) ||
  'http://localhost:8080';

/**
 * Resolve a bare filename from the DB into a full legacy upload URL.
 * folder = 'images' | 'banners' | 'news' | 'uploads' etc.
 */
export function resolveImage(
  src?: string | null,
  folder: string = 'images',
): string | null {
  if (!src) return null;
  if (src.startsWith('http') || src.startsWith('/')) return src;
  // Encode the filename so spaces / special chars in legacy filenames work
  return `${LEGACY_BASE}/uploads/${folder}/${encodeURIComponent(src)}`;
}

/** Resolve a user profile picture, falling back to /img/profile.png */
export function resolveAvatar(pic?: string | null): string {
  if (!pic) return '/img/profile.png';
  if (pic.startsWith('http') || pic.startsWith('/')) return pic;
  return `${LEGACY_BASE}/uploads/images/${encodeURIComponent(pic)}`;
}
