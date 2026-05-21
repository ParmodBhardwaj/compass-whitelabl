#!/usr/bin/env node
/**
 * Standalone (no deps) version of packages/db/scripts/generate-models-from-sql.ts.
 * Lets you generate models before `pnpm install` finishes.
 */
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SQL_PATH = join(__dirname, '../../DatabaseDump.sql');
const OUT_DIR = join(__dirname, '../packages/db/src/models/generated');

function parseDump(sql) {
  const tables = [];
  const re = /CREATE TABLE\s+`?([a-zA-Z0-9_]+)`?\s*\(([\s\S]*?)\)\s*ENGINE/g;
  let m;
  while ((m = re.exec(sql)) !== null) {
    const name = m[1];
    const body = m[2];
    const columns = [];
    const primaryKey = [];
    for (const raw of splitTopLevelCommas(body)) {
      const line = raw.trim();
      if (!line) continue;
      const upper = line.toUpperCase();
      if (upper.startsWith('PRIMARY KEY')) {
        const pk = line.match(/\(([^)]+)\)/);
        if (pk) primaryKey.push(...pk[1].split(',').map((c) => c.trim().replace(/`/g, '')));
        continue;
      }
      if (upper.startsWith('KEY ') || upper.startsWith('UNIQUE') || upper.startsWith('INDEX') || upper.startsWith('CONSTRAINT') || upper.startsWith('FULLTEXT')) continue;
      const col = parseColumn(line);
      if (col) columns.push(col);
    }
    tables.push({ name, columns, primaryKey });
  }
  return tables;
}

function splitTopLevelCommas(body) {
  const out = []; let depth = 0; let buf = '';
  for (const ch of body) {
    if (ch === '(') depth++; else if (ch === ')') depth--;
    if (ch === ',' && depth === 0) { out.push(buf); buf = ''; } else buf += ch;
  }
  if (buf.trim()) out.push(buf);
  return out;
}

function parseColumn(line) {
  const m = line.match(/^`?([a-zA-Z0-9_]+)`?\s+([a-zA-Z]+(?:\([^)]+\))?(?:\s+unsigned)?)(.*)$/i);
  if (!m) return null;
  return {
    name: m[1],
    sqlType: m[2],
    notNull: /\bNOT\s+NULL\b/i.test(m[3] || ''),
    autoIncrement: /\bAUTO_INCREMENT\b/i.test(m[3] || ''),
  };
}

function mysqlToSequelize(t) {
  t = t.toLowerCase();
  if (/^tinyint\(1\)/.test(t)) return 'DataType.BOOLEAN';
  if (/^tinyint/.test(t)) return 'DataType.TINYINT';
  if (/^smallint/.test(t)) return 'DataType.SMALLINT';
  if (/^mediumint/.test(t)) return 'DataType.MEDIUMINT';
  if (/^bigint/.test(t)) return 'DataType.BIGINT';
  if (/^int/.test(t)) return 'DataType.INTEGER';
  if (/^float/.test(t)) return 'DataType.FLOAT';
  if (/^double|^decimal|^numeric/.test(t)) return 'DataType.DECIMAL';
  if (/^datetime|^timestamp/.test(t)) return 'DataType.DATE';
  if (/^date/.test(t)) return 'DataType.DATEONLY';
  if (/^time/.test(t)) return 'DataType.TIME';
  if (/^year/.test(t)) return 'DataType.INTEGER';
  if (/^char|^varchar/.test(t)) {
    const len = t.match(/\((\d+)\)/);
    return `DataType.STRING(${len ? len[1] : 255})`;
  }
  if (/^tinytext|^text|^mediumtext|^longtext/.test(t)) return 'DataType.TEXT';
  if (/^blob|^longblob|^mediumblob|^tinyblob|^binary|^varbinary/.test(t)) return 'DataType.BLOB';
  if (/^json/.test(t)) return 'DataType.JSON';
  return 'DataType.STRING';
}

const pascal = (s) => s.split(/[_-]/).filter(Boolean).map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase()).join('');
const camel = (s) => { const p = pascal(s); return p[0].toLowerCase() + p.slice(1); };

function emit(table) {
  const cls = pascal(table.name);
  const lines = [
    `// AUTO-GENERATED from DatabaseDump.sql — do not edit by hand.`,
    `// Re-run: pnpm db:generate-models`,
    ``,
    `import { Table, Column, Model, DataType, PrimaryKey, AutoIncrement, AllowNull } from 'sequelize-typescript';`,
    ``,
    `@Table({ tableName: '${table.name}', timestamps: false })`,
    `export class ${cls} extends Model<${cls}> {`,
  ];
  for (const c of table.columns) {
    const isPk = table.primaryKey.includes(c.name);
    if (isPk) lines.push('  @PrimaryKey');
    if (c.autoIncrement) lines.push('  @AutoIncrement');
    if (!c.notNull) lines.push('  @AllowNull(true)');
    lines.push(`  @Column({ type: ${mysqlToSequelize(c.sqlType)}, field: '${c.name}' })`);
    lines.push(`  ${camel(c.name)}!: any;`);
    lines.push('');
  }
  lines.push('}');
  lines.push('');
  return lines.join('\n');
}

if (!existsSync(SQL_PATH)) { console.error('SQL dump not found at', SQL_PATH); process.exit(1); }
const sql = readFileSync(SQL_PATH, 'utf8');
const tables = parseDump(sql);
if (existsSync(OUT_DIR)) rmSync(OUT_DIR, { recursive: true, force: true });
mkdirSync(OUT_DIR, { recursive: true });
for (const t of tables) writeFileSync(join(OUT_DIR, `${pascal(t.name)}.model.ts`), emit(t));
const idx = tables.map((t) => `export { ${pascal(t.name)} } from './${pascal(t.name)}.model';`).join('\n') + '\n';
writeFileSync(join(OUT_DIR, 'index.ts'), idx);
console.log(`Wrote ${tables.length} Sequelize models to ${OUT_DIR}`);
