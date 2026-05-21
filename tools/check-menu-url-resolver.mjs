/**
 * tools/check-menu-url-resolver.mjs
 *
 * Sanity check: take every distinct `menu.url` from the live MySQL DB and
 * pass it through the resolver with the active portal's segment, then print
 * the (url, portal, resolved) triples. Lets us spot mis-resolutions before
 * clicking around the UI.
 *
 * Run: node tools/check-menu-url-resolver.mjs
 *
 * (Resolver is inlined from apps/web/src/lib/portal-url.ts so we don't need
 *  a TS loader in this small script.)
 */
import mysql from 'mysql2/promise';

const ABSOLUTE_PATH_PREFIXES = new Set([
  'main','visitors','tpm','audit','idea','rnd','kpoint','dni','oee','hm3h',
  'tcg','quality-alert','mp-sheet','mpsheet','sale-rent','sales','rides',
  'carpool','is-portal','isportal',
  'kaizen','kaizenSupport','training','csr','atracker','heroQFD','kpoint-home',
  'bsvi','loss-sheet','performance-report','performance-percentage','opl-report',
  'tag-report','sop-process','miscellaneous','assessment','tax','page',
  'category','program','request','single-policy','guest','profile','admin','login',
]);

function withHtml(input) {
  if (!input) return '#';
  const url = input.trim();
  if (!url || url === '#') return '#';
  if (/^https?:\/\//i.test(url) || /^(mailto:|tel:|javascript:|data:|blob:)/i.test(url)) return url;
  let path = url, suffix = '';
  const h = path.indexOf('#'); if (h >= 0) { suffix = path.slice(h) + suffix; path = path.slice(0, h); }
  const q = path.indexOf('?'); if (q >= 0) { suffix = path.slice(q) + suffix; path = path.slice(0, q); }
  let normalized = path.startsWith('/') ? path : '/portal/' + path.replace(/^\.?\/?/, '');
  normalized = normalized.replace(/\/+$/, '');
  if (!normalized.endsWith('.html')) normalized += '.html';
  return normalized + suffix;
}
function resolveMenuUrl(input, portalSegment) {
  if (!input) return '#';
  const url = input.trim();
  if (!url || url === '#') return '#';
  if (/^https?:\/\//i.test(url) || /^(mailto:|tel:|javascript:|data:|blob:)/i.test(url)) return url;
  if (url.startsWith('/')) return withHtml(url);
  const firstSeg = url.split('/')[0].replace(/\.html$/i, '').toLowerCase();
  if (ABSOLUTE_PATH_PREFIXES.has(firstSeg)) return withHtml(url);
  if (portalSegment) return withHtml(`${portalSegment}/${url}`);
  return withHtml(url);
}

const aliasToSegment = {
  main: '', sales: 'sale-rent', rides: 'carpool', isportal: 'is-portal', 'mp-sheet': 'mpsheet',
};
const segFor = (alias) => (alias && alias in aliasToSegment) ? aliasToSegment[alias] : (alias ?? '');

const conn = await mysql.createConnection({
  host: '127.0.0.1', user: 'root', password: '', database: 'phpherocompass',
});
const [stores] = await conn.execute('SELECT store_id, name, alias FROM acl_stores');
const storeById = new Map(stores.map(s => [s.store_id, s]));

const [rows] = await conn.execute(`
  SELECT m.store, m.menu_name, m.url
    FROM menu m
   WHERE m.position='1' AND m.active='1' AND m.url <> '' AND m.url <> '#'
   ORDER BY m.store, m.ordering
`);

console.log('store | portal_segment   | raw_url'.padEnd(80) + '| resolved');
console.log('-'.repeat(140));
for (const r of rows) {
  const store = storeById.get(r.store);
  const seg = segFor(store?.alias);
  const resolved = resolveMenuUrl(r.url, seg);
  console.log(
    String(r.store).padStart(5) + ' | ' +
    String(seg).padEnd(16) + ' | ' +
    String(r.url ?? '').padEnd(50) + ' | ' +
    resolved
  );
}
await conn.end();
