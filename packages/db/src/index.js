"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.where = exports.literal = exports.col = exports.fn = exports.Transaction = exports.QueryTypes = exports.Op = exports.Sequelize = void 0;
exports.initDb = initDb;
exports.getDb = getDb;
const sequelize_typescript_1 = require("sequelize-typescript");
Object.defineProperty(exports, "Sequelize", { enumerable: true, get: function () { return sequelize_typescript_1.Sequelize; } });
let sequelize = null;
function initDb(config) {
    if (sequelize)
        return sequelize;
    sequelize = new sequelize_typescript_1.Sequelize({
        dialect: 'mysql',
        host: config.host,
        port: config.port,
        database: config.database,
        username: config.username,
        password: config.password,
        logging: config.logging ?? false,
        define: { timestamps: false, freezeTableName: true },
        pool: { max: 20, min: 0, idle: 10000 },
        models: Object.values(require('./models/generated')),
    });
    return sequelize;
}
function getDb() {
    if (!sequelize)
        throw new Error('DB not initialized — call initDb() first');
    return sequelize;
}
var sequelize_1 = require("sequelize");
Object.defineProperty(exports, "Op", { enumerable: true, get: function () { return sequelize_1.Op; } });
Object.defineProperty(exports, "QueryTypes", { enumerable: true, get: function () { return sequelize_1.QueryTypes; } });
Object.defineProperty(exports, "Transaction", { enumerable: true, get: function () { return sequelize_1.Transaction; } });
Object.defineProperty(exports, "fn", { enumerable: true, get: function () { return sequelize_1.fn; } });
Object.defineProperty(exports, "col", { enumerable: true, get: function () { return sequelize_1.col; } });
Object.defineProperty(exports, "literal", { enumerable: true, get: function () { return sequelize_1.literal; } });
Object.defineProperty(exports, "where", { enumerable: true, get: function () { return sequelize_1.where; } });
//# sourceMappingURL=index.js.map