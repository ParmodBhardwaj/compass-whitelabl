/**
 * Helpers to produce legacy-style URLs that end in `.html`.
 *
 * The legacy PHP portal rendered every page as `<route>.html`. We preserve
 * the same convention so:
 *   • bookmarks from the legacy site keep working
 *   • emails / links sent before the migration still resolve
 *   • the address bar matches what users are used to
 *
 * Pair with the Next.js rewrite (`{ source: '/portal/:path*.html', destination: '/portal/:path*' }`)
 * so the suffixed URL still routes to the real Next.js page.
 */

/**
 * Top-level path segments that are ABSOLUTE in the legacy PHP system. When a
 * menu URL starts with one of these, it should be treated as `/portal/<seg>/...`
 * rather than relative-to-current-portal.
 *
 * Two categories live here:
 *   • Portal alias segments (one per row in `acl_stores`) — e.g. `visitors`,
 *     `tpm`, `audit`. These are the new-portal URL segments matching
 *     `PORTAL_ALIAS_TO_SEGMENT` in Sidebar.tsx.
 *   • Standalone module roots that don't have their own portal but ARE
 *     reachable as absolute paths — e.g. `kaizen`, `training`, `csr`,
 *     `atracker`, `kpoint-home`, `page` (CMS), `category` (CMS), etc.
 *     These were derived by inspecting `SELECT DISTINCT SUBSTRING_INDEX(url,'/',1) FROM menu`.
 */
export const ABSOLUTE_PATH_PREFIXES = new Set<string>([
  // Portal aliases / segments
  'main',
  'visitors',
  'tpm',
  'audit',
  'idea',
  'rnd',
  'kpoint',
  'dni',
  'oee',
  'hm3h',
  'tcg',
  'quality-alert',
  'mp-sheet',
  'mpsheet',
  'sale-rent',
  'sales',
  'rides',
  'carpool',
  'is-portal',
  'isportal',
  // Standalone modules (no own portal but linked via cross-portal menus)
  'kaizen',
  'kaizenSupport',
  'training',
  'csr',
  'atracker',
  'heroQFD',
  'kpoint-home',
  'bsvi',
  'loss-sheet',
  'performance-report',
  'performance-percentage',
  'opl-report',
  'tag-report',
  'sop-process',
  'miscellaneous',
  'assessment',
  'tax',
  'page',
  'category',
  'program',
  'request',
  'single-policy',
  'guest',
  'profile',
  'admin',
  'login',
]);

/**
 * Append `.html` to a portal URL when appropriate.
 *
 * Rules:
 *   • absolute http(s) URLs        → unchanged (external link)
 *   • empty / `#` / `javascript:`  → unchanged (no real navigation)
 *   • already ends with `.html`    → unchanged
 *   • URLs with a query string     → `.html` inserted before `?`
 *   • URLs with a hash             → `.html` inserted before `#`
 *   • other absolute paths         → trailing slash stripped, `.html` appended
 *   • relative paths               → assumed to live under `/portal/`,
 *                                    prefixed automatically (so the legacy DB
 *                                    column `url = 'policy'` becomes
 *                                    `/portal/policy.html`)
 */
export function withHtml(input?: string | null): string {
  if (!input) return '#';
  const url = input.trim();
  if (!url) return '#';

  // External or pseudo-protocols — leave alone.
  if (
    /^https?:\/\//i.test(url) ||
    /^(mailto:|tel:|javascript:|data:|blob:)/i.test(url) ||
    url === '#'
  ) {
    return url;
  }

  // Split off query + fragment so we can splice `.html` in front of them.
  let path = url;
  let suffix = '';
  const hashIdx = path.indexOf('#');
  if (hashIdx >= 0) {
    suffix = path.slice(hashIdx) + suffix;
    path = path.slice(0, hashIdx);
  }
  const queryIdx = path.indexOf('?');
  if (queryIdx >= 0) {
    suffix = path.slice(queryIdx) + suffix;
    path = path.slice(0, queryIdx);
  }

  // Normalize leading slash. Bare paths from DB ("policy") live under /portal/.
  let normalized: string;
  if (path.startsWith('/')) {
    normalized = path;
  } else {
    normalized = '/portal/' + path.replace(/^\.?\/?/, '');
  }

  // Drop any trailing slash before tacking on .html.
  normalized = normalized.replace(/\/+$/, '');

  if (!normalized.endsWith('.html')) {
    normalized += '.html';
  }
  return normalized + suffix;
}

/**
 * Portal-aware menu URL resolver.
 *
 * The legacy `menu.url` column contains paths that are either absolute
 * (`tpm/hazard.html`, `kaizen/kaizen-dashboard.html`, `policy.html`) or
 * relative to the current portal (`appointment/add.html` under the Visitors
 * portal → `/visitors/appointment/add.html`).
 *
 * Legacy PHP disambiguated this via its route table. We approximate the same
 * behavior with a curated allow-list of absolute top-level prefixes
 * (`ABSOLUTE_PATH_PREFIXES`). Anything not on the list is treated as relative
 * to the active portal — which is what the legacy router did when no
 * top-level route matched.
 *
 * @param input  Raw URL from `menu.url` (e.g. `appointment/add.html`)
 * @param portalSegment  Current portal's URL segment under /portal/* (e.g. `visitors`).
 *                       Empty string for the Main portal.
 */
export function resolveMenuUrl(input: string | null | undefined, portalSegment: string): string {
  if (!input) return '#';
  const url = input.trim();
  if (!url || url === '#') return '#';

  // External & pseudo-protocols.
  if (
    /^https?:\/\//i.test(url) ||
    /^(mailto:|tel:|javascript:|data:|blob:)/i.test(url)
  ) {
    return url;
  }

  // Already an absolute path on our domain.
  if (url.startsWith('/')) {
    return withHtml(url);
  }

  // First path segment determines absolute vs. relative-to-portal.
  const firstSeg = url.split('/')[0].replace(/\.html$/i, '').toLowerCase();

  // Absolute legacy module path — render as /portal/<url>.html.
  if (ABSOLUTE_PATH_PREFIXES.has(firstSeg)) {
    return withHtml(url);
  }

  // Relative — prepend the active portal segment so PHP-style relative URLs
  // like `appointment/add.html` (under Visitors) resolve correctly.
  // Empty portalSegment means we're on Main portal → fall through to flat
  // /portal/<url>.html resolution.
  if (portalSegment) {
    return withHtml(`${portalSegment}/${url}`);
  }
  return withHtml(url);
}
