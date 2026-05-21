#!/usr/bin/env node
/**
 * Walk legacy module/<X>/config/module.config.php files and emit a one-pager
 * stub at hero-compass/docs/modules/<X>.md for each enabled module.
 *
 * Run: node hero-compass/scripts/generate-module-specs.mjs
 */
import { readFileSync, readdirSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '../..');
const MODULES_DIR = join(ROOT, 'module');
const OUT_DIR = join(__dirname, '../docs/modules');

mkdirSync(OUT_DIR, { recursive: true });

const enabled = readFileSync(join(ROOT, 'config/modules.config.php'), 'utf8')
  .split('\n')
  .map((l) => l.trim())
  .filter((l) => /^['"][A-Z][A-Za-z]+['"]/.test(l) && !l.startsWith('//'))
  .map((l) => l.replace(/^['"]|['"],?$/g, ''));

const modules = readdirSync(MODULES_DIR).filter((d) => enabled.includes(d));

function extractRoutes(php) {
  const routes = [];
  const routeRegex = /'route'\s*=>\s*'([^']+)'/g;
  let m;
  while ((m = routeRegex.exec(php))) routes.push(m[1]);
  return [...new Set(routes)];
}

function extractControllers(php) {
  const out = [];
  const re = /Controller\\([A-Za-z]+Controller)/g;
  let m;
  while ((m = re.exec(php))) out.push(m[1]);
  return [...new Set(out)];
}

for (const mod of modules) {
  const cfgPath = join(MODULES_DIR, mod, 'config/module.config.php');
  if (!existsSync(cfgPath)) continue;
  const php = readFileSync(cfgPath, 'utf8');
  const routes = extractRoutes(php);
  const controllers = extractControllers(php);

  const md = `# ${mod}

> Auto-generated stub. Fill in as we migrate the module.

## Source
- Laminas module: \`module/${mod}/\`
- Config: \`module/${mod}/config/module.config.php\`

## Routes (extracted)
${routes.length ? routes.map((r) => `- \`${r}\``).join('\n') : '_(no routes found in module.config.php — may use child routes)_'}

## Controllers (extracted)
${controllers.length ? controllers.map((c) => `- ${c}`).join('\n') : '_none detected_'}

## DB tables touched
TODO — list during migration.

## ACL roles required
TODO.

## Mail / SMS triggers
TODO.

## Integrations
TODO (LDAP / SAP / kPoint / file storage / etc.)

## Migration target
- API module: \`apps/api/src/modules/${mod.toLowerCase()}/\`
- Web routes: \`apps/web/src/app/(modules)/${mod.toLowerCase()}/\`
- Wave: TODO

## Parity tests
TODO — Postman/Playwright checklist.
`;
  writeFileSync(join(OUT_DIR, `${mod}.md`), md);
}

console.log(`Wrote ${modules.length} module specs to ${OUT_DIR}`);
