// Compare every legacy `store_modules.route_name` against our Next.js admin
// pages + the AdminSidebar route-alias map. Lists which routes still fall
// through to the "Under Migration" catch-all.
import fs from 'node:fs';
import path from 'node:path';
const ADMIN_ROOT = path.resolve(
  'D:/Vibe/Compass/HeroErpMigrate8.2NewZone/hero-compass/apps/web/src/app/admin',
);
const SIDEBAR_PATH = path.resolve(
  'D:/Vibe/Compass/HeroErpMigrate8.2NewZone/hero-compass/apps/web/src/components/legacy/AdminSidebar.tsx',
);
const ROUTES_FILE = path.resolve(
  'D:/Vibe/Compass/HeroErpMigrate8.2NewZone/hero-compass/tools/legacy-routes.txt',
);

// 1. Read every legacy route from the pre-dumped file.
const routes = fs.readFileSync(ROUTES_FILE, 'utf8')
  .split('\n').map((l) => l.trim()).filter(Boolean);

// 2. Parse the alias table out of AdminSidebar.tsx.
const sidebar = fs.readFileSync(SIDEBAR_PATH, 'utf8');
const aliases = new Map();
const aliasRegex = /'([^']+)':\s*'([^']+)'/g;
let inAliasBlock = false;
for (const line of sidebar.split('\n')) {
  if (line.includes('ROUTE_ALIASES')) inAliasBlock = true;
  if (!inAliasBlock) continue;
  if (line.includes('};')) break;
  const m = aliasRegex.exec(line);
  if (m) {
    aliases.set(m[1], m[2]);
  }
  aliasRegex.lastIndex = 0;
}

// 3. Walk apps/web/src/app/admin and collect every page route.
function collectPages(dir, base = '/admin') {
  const pages = new Set();
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const sub = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // dynamic [slug] segments — note but skip from positive coverage
      if (entry.name.startsWith('[')) continue;
      collectPages(sub, `${base}/${entry.name}`).forEach((p) => pages.add(p));
    } else if (entry.name === 'page.tsx') {
      pages.add(base);
    }
  }
  return pages;
}
const pageSet = collectPages(ADMIN_ROOT);

// 4. Same URL-derivation logic as AdminSidebar.urlFor() (without action suffix).
function urlFor(route) {
  if (aliases.has(route)) return aliases.get(route).split('?')[0]; // strip query
  if (route.startsWith('lmcadmin/')) return '/' + route.replace(/^lmcadmin\//, 'admin/');
  if (route.startsWith('/')) return route;
  return '/' + route;
}

const covered = [];
const missing = [];
for (const r of routes) {
  const target = urlFor(r);
  // /portal/* aliases count as covered (legacy admins sometimes pointed at
  // portal-side pages, e.g. tpm/hazardRequest is the portal-side hazard view).
  const isCovered = pageSet.has(target) || target.startsWith('/portal/');
  if (isCovered) covered.push({ r, via: aliases.has(r) ? 'alias' : 'direct', target });
  else missing.push({ r, target });
}

console.log(`Total legacy routes:  ${routes.length}`);
console.log(`Covered:              ${covered.length}`);
console.log(`Falling to catch-all: ${missing.length}`);
console.log('');
console.log('── MISSING ROUTES ───────────────────────────────────────────');
for (const m of missing) {
  console.log(`  ${m.r.padEnd(48)} → ${m.target}`);
}
