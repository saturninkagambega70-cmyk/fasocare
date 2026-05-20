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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
exports.TotpService = void 0;
const common_1 = require("@nestjs/common");
const crypto = __importStar(require("crypto"));
let TotpService = class TotpService {
    generateSecret() {
        return crypto.randomBytes(20).toString("hex");
    }
    generateTOTP(secret, window = 0) {
        let counter = Math.floor(Date.now() / 30000) + window;
        const counterBuf = Buffer.alloc(8);
        for (let i = 7; i >= 0; i--) {
            counterBuf[i] = counter & 0xff;
            counter >>= 8;
        }
        const hmac = crypto.createHmac("sha1", Buffer.from(secret, "hex"));
        hmac.update(counterBuf);
        const result = hmac.digest();
        const offset = result[result.length - 1] & 0xf;
        const code = ((result[offset] & 0x7f) << 24) |
            ((result[offset + 1] & 0xff) << 16) |
            ((result[offset + 2] & 0xff) << 8) |
            (result[offset + 3] & 0xff);
        return String(code % 1000000).padStart(6, "0");
    }
    verifyTOTP(token, secret, windows = 2) {
        for (let w = -windows; w <= windows; w++) {
            if (this.generateTOTP(secret, w) === token)
                return true;
        }
        return false;
    }
    getProvisioningUri(secret, email, issuer = "FasoCare") {
        const encodedIssuer = encodeURIComponent(issuer);
        const encodedEmail = encodeURIComponent(email);
        return `otpauth://totp/${encodedIssuer}:${encodedEmail}?secret=${Buffer.from(secret, "hex").toString("base64").replace(/=/g, "")}&issuer=${encodedIssuer}&algorithm=SHA1&digits=6&period=30`;
    }
    generateBackupCodes(count = 8) {
        const codes = [];
        for (let i = 0; i < count; i++) {
            codes.push(crypto.randomBytes(4).toString("hex").toUpperCase());
        }
        return codes;
    }
};
exports.TotpService = TotpService;
exports.TotpService = TotpService = __decorate([
    (0, common_1.Injectable)()
], TotpService);
//# sourceMappingURL=totp.service.js.map