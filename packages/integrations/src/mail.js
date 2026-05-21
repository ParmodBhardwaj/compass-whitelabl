"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initMail = initMail;
exports.sendMail = sendMail;
const nodemailer_1 = __importDefault(require("nodemailer"));
let transporter = null;
function initMail(cfg) {
    transporter = nodemailer_1.default.createTransport({
        host: cfg.host,
        port: cfg.port,
        auth: cfg.user ? { user: cfg.user, pass: cfg.pass } : undefined,
    });
    transporter._heroFrom = cfg.from;
    return transporter;
}
async function sendMail(opts) {
    if (!transporter)
        throw new Error('mail not initialized');
    return transporter.sendMail({ from: transporter._heroFrom, ...opts });
}
//# sourceMappingURL=mail.js.map