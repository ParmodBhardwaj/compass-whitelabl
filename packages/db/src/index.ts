import { Sequelize } from 'sequelize-typescript';

let sequelize: Sequelize | null = null;

export interface DbConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  logging?: boolean;
}

export function initDb(config: DbConfig): Sequelize {
  if (sequelize) return sequelize;
  sequelize = new Sequelize({
    dialect: 'mysql',
    host: config.host,
    port: config.port,
    database: config.database,
    username: config.username,
    password: config.password,
    logging: config.logging ?? false,
    define: { timestamps: false, freezeTableName: true },
    pool: { max: 20, min: 0, idle: 10000 },
    // Register both auto-generated and hand-maintained models. The manual
    // bundle exists so models whose tables aren't in the regen dump (e.g.
    // Insurance) still survive `pnpm db:generate-models`.
    models: [
      ...Object.values(require('./models/generated')),
      ...Object.values(require('./models/manual')),
    ] as any,
  });
  return sequelize;
}

export function getDb(): Sequelize {
  if (!sequelize) throw new Error('DB not initialized — call initDb() first');
  return sequelize;
}

export { Sequelize };
export { Op, QueryTypes, Transaction, fn, col, literal, where } from 'sequelize';
