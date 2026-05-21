import { Sequelize } from 'sequelize-typescript';
export interface DbConfig {
    host: string;
    port: number;
    database: string;
    username: string;
    password: string;
    logging?: boolean;
}
export declare function initDb(config: DbConfig): Sequelize;
export declare function getDb(): Sequelize;
export { Sequelize };
export { Op, QueryTypes, Transaction, fn, col, literal, where } from 'sequelize';
