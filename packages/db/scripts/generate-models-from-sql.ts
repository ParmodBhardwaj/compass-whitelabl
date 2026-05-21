/**
 * Parse the legacy DatabaseDump.sql and emit one Sequelize model per CREATE TABLE.
 *
 * Run: pnpm db:generate-models
 *
 * Output: packages/db/src/models/generated/<TableName>.model.ts
 *
 * This is intentionally a forgiving regex-based parser — the dump is hand-curated
 * MySQL DDL, not arbitrary SQL. We extract: column name, MySQL type, NULL/NOT NULL,
 * DEFAULT, PRIMARY KEY. Foreign keys are not modeled here (associations are added
 * per-module as we migrate).
 */

import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SQL_PATH = join(__dirname, '../../../../DatabaseDump.sql');
const OUT_DIR = join(__dirname, '../src/models/generated');

interface Column {
  name: string;
  sqlType: string;
  notNull: boolean;
  defaultValue: string | null;
  autoIncrement: boolean;
}

interface Table {
  name: string;
  columns: Column[];
  primaryKey: string[];
}

function parseDump(sql: string): Table[] {
  const tables: Table[] = [];
  const tableRegex = /CREATE TABLE\s+`?([a-zA-Z0-9_]+)`?\s*\(([\s\S]*?)\)\s*ENGINE/g;
  let m: RegExpExecArray | null;
  while ((m = tableRegex.exec(sql)) !== null) {
    const name = m[1];
    const body = m[2];
    const columns: Column[] = [];
    const primaryKey: string[] = [];
    const lines = splitTopLevelCommas(body);
    for (const raw of lines) {
      const line = raw.trim();
      if (!line) continue;
      const upper = line.toUpperCase();
      if (upper.startsWith('PRIMARY KEY')) {
        const pkMatch = line.match(/\(([^)]+)\)/);
        if (pkMatch) primaryKey.push(...pkMatch[1].split(',').map((c) => c.trim().replace(/`/g, '')));
        continue;
      }
      if (upper.startsWith('KEY ') || upper.startsWith('UNIQUE') || upper.startsWith('INDEX') || upper.startsWith('CONSTRAINT') || upper.startsWith('FULLTEXT')) {
        continue;
      }
      const col = parseColumn(line);
      if (col) columns.push(col);
    }
    tables.push({ name, columns, primaryKey });
  }
  return tables;
}

function splitTopLevelCommas(body: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let buf = '';
  for (const ch of body) {
    if (ch === '(') depth++;
    else if (ch === ')') depth--;
    if (ch === ',' && depth === 0) {
      out.push(buf);
      buf = '';
    } else {
      buf += ch;
    }
  }
  if (buf.trim()) out.push(buf);
  return out;
}

function parseColumn(line: string): Column | null {
  const m = line.match(/^`?([a-zA-Z0-9_]+)`?\s+([a-zA-Z]+(?:\([^)]+\))?(?:\s+unsigned)?)(.*)$/i);
  if (!m) return null;
  const name = m[1];
  const sqlType = m[2];
  const rest = m[3] || '';
  const notNull = /\bNOT\s+NULL\b/i.test(rest);
  const autoIncrement = /\bAUTO_INCREMENT\b/i.test(rest);
  const defMatch = rest.match(/DEFAULT\s+('(?:[^']|'')*'|[^,\s]+)/i);
  const defaultValue = defMatch ? defMatch[1].replace(/^'|'$/g, '') : null;
  return { name, sqlType, notNull, defaultValue, autoIncrement };
}

function mysqlToSequelizeType(sqlType: string): string {
  const t = sqlType.toLowerCase();
  if (/^tinyint\(1\)/.test(t)) return 'DataType.BOOLEAN';
  if (/^tinyint/.test(t)) return 'DataType.TINYINT';
  if (/^smallint/.test(t)) return 'DataType.SMALLINT';
  if (/^mediumint/.test(t)) return 'DataType.MEDIUMINT';
  if (/^bigint/.test(t)) return 'DataType.BIGINT';
  if (/^int/.test(t)) return 'DataType.INTEGER';
  if (/^float/.test(t)) return 'DataType.FLOAT';
  if (/^double|^decimal|^numeric/.test(t)) return 'DataType.DECIMAL';
  if (/^datetime/.test(t)) return 'DataType.DATE';
  if (/^timestamp/.test(t)) return 'DataType.DATE';
  if (/^date/.test(t)) return 'DataType.DATEONLY';
  if (/^time/.test(t)) return 'DataType.TIME';
  if (/^year/.test(t)) return 'DataType.INTEGER';
  if (/^char/.test(t) || /^varchar/.test(t)) {
    const len = t.match(/\((\d+)\)/);
    return `DataType.STRING(${len ? len[1] : 255})`;
  }
  if (/^tinytext|^text|^mediumtext|^longtext/.test(t)) return 'DataType.TEXT';
  if (/^blob|^longblob|^mediumblob|^tinyblob|^binary|^varbinary/.test(t)) return 'DataType.BLOB';
  if (/^enum/.test(t)) return 'DataType.STRING';
  if (/^json/.test(t)) return 'DataType.JSON';
  return 'DataType.STRING';
}

function pascalCase(snake: string): string {
  return snake.split(/[_-]/).filter(Boolean).map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase()).join('');
}

function camelCase(snake: string): string {
  const p = pascalCase(snake);
  return p[0].toLowerCase() + p.slice(1);
}

function emit(table: Table): string {
  const className = pascalCase(table.name);
  const lines: string[] = [];
  lines.push(`// AUTO-GENERATED from DatabaseDump.sql — do not edit by hand.`);
  lines.push(`// Re-run: pnpm db:generate-models`);
  lines.push('');
  lines.push(`import { Table, Column, Model, DataType, PrimaryKey, AutoIncrement, AllowNull } from 'sequelize-typescript';`);
  lines.push('');
  lines.push(`@Table({ tableName: '${table.name}', timestamps: false })`);
  lines.push(`export class ${className} extends Model<${className}> {`);
  // If no PK was declared but an `id` column exists, treat it as the PK.
  // Sequelize requires every auto-increment column to be a PK. If the SQL had
  // no PRIMARY KEY declared, fall back to (a) the auto-increment column or
  // (b) a column literally named `id`.
  const autoIncCol = table.columns.find((c) => c.autoIncrement);
  const effectivePk =
    table.primaryKey.length > 0
      ? table.primaryKey
      : autoIncCol
      ? [autoIncCol.name]
      : table.columns.some((c) => c.name === 'id')
      ? ['id']
      : [];
  for (const col of table.columns) {
    const isPk = effectivePk.includes(col.name);
    if (isPk) lines.push(`  @PrimaryKey`);
    if (col.autoIncrement) lines.push(`  @AutoIncrement`);
    if (!col.notNull) lines.push(`  @AllowNull(true)`);
    const sequelizeType = mysqlToSequelizeType(col.sqlType);
    lines.push(`  @Column({ type: ${sequelizeType}, field: '${col.name}' })`);
    // Use `declare` instead of `!:` so the property does NOT become a public class
    // field that shadows Sequelize's attribute getter/setter. (See
    // https://sequelize.org/main/manual/model-basics.html#caveat-with-public-class-fields)
    lines.push(`  declare ${camelCase(col.name)}: any;`);
    lines.push('');
  }
  lines.push(`}`);
  lines.push('');
  lines.push(`export default ${className};`);
  lines.push('');
  return lines.join('\n');
}

function main() {
  if (!existsSync(SQL_PATH)) {
    console.error(`SQL dump not found at ${SQL_PATH}`);
    process.exit(1);
  }
  const sql = readFileSync(SQL_PATH, 'utf8');
  const tables = parseDump(sql);
  console.log(`Parsed ${tables.length} tables`);
  if (existsSync(OUT_DIR)) rmSync(OUT_DIR, { recursive: true, force: true });
  mkdirSync(OUT_DIR, { recursive: true });
  for (const t of tables) {
    const code = emit(t);
    writeFileSync(join(OUT_DIR, `${pascalCase(t.name)}.model.ts`), code);
  }
  const indexLines = tables.map((t) => `export { ${pascalCase(t.name)} } from './${pascalCase(t.name)}.model';`);
  writeFileSync(join(OUT_DIR, 'index.ts'), indexLines.join('\n') + '\n');
  console.log(`Wrote ${tables.length} models to ${OUT_DIR}`);
}

main();
