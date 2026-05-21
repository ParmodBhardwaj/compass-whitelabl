"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initKpoint = initKpoint;
exports.getKpointVideoMeta = getKpointVideoMeta;
const axios_1 = __importDefault(require("axios"));
let cfg = null;
function initKpoint(c) { cfg = c; }
async function getKpointVideoMeta(videoId) {
    if (!cfg)
        throw new Error('kpoint not initialized');
    const { data } = await axios_1.default.get(`${cfg.baseUrl}/videos/${videoId}`, {
        headers: cfg.apiKey ? { Authorization: `Bearer ${cfg.apiKey}` } : {},
    });
    return data;
}
//# sourceMappingURL=kpoint.js.map