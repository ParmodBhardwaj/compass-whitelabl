"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.initSap = initSap;
exports.getSapClient = getSapClient;
exports.callSap = callSap;
const soap = __importStar(require("soap"));
let client = null;
let cfg = null;
function initSap(c) { cfg = c; }
async function getSapClient() {
    if (client)
        return client;
    if (!cfg?.wsdlUrl)
        throw new Error('SAP not configured (set SAP_WSDL_URL)');
    client = await soap.createClientAsync(cfg.wsdlUrl);
    if (cfg.username)
        client.setSecurity(new soap.BasicAuthSecurity(cfg.username, cfg.password ?? ''));
    return client;
}
async function callSap(operation, args) {
    const c = await getSapClient();
    const fn = c[`${operation}Async`];
    if (!fn)
        throw new Error(`SAP operation not found: ${operation}`);
    const [result] = await fn(args);
    return result;
}
//# sourceMappingURL=sap.js.map