"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initSms = initSms;
exports.sendSms = sendSms;
const axios_1 = __importDefault(require("axios"));
let cfg = null;
function initSms(c) { cfg = c; }
async function sendSms(to, message) {
    if (!cfg)
        throw new Error('sms not initialized');
    return axios_1.default.post(cfg.apiUrl, { to, message }, { headers: { Authorization: `Bearer ${cfg.apiKey}` } });
}
//# sourceMappingURL=sms.js.map