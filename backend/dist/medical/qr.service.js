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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QrService = void 0;
const common_1 = require("@nestjs/common");
const crypto = __importStar(require("crypto"));
const config_1 = require("@nestjs/config");
let QrService = class QrService {
    constructor(configService) {
        this.configService = configService;
        this.secret =
            this.configService.get("JWT_SECRET") ||
                "faso-care-default-secret";
    }
    generateSecureToken(data) {
        const hmac = crypto.createHmac("sha256", this.secret);
        hmac.update(data);
        const signature = hmac.digest("hex").substring(0, 8);
        return `${data}.${signature}`;
    }
    validateToken(token) {
        const lastDot = token.lastIndexOf(".");
        if (lastDot === -1)
            return false;
        const data = token.substring(0, lastDot);
        const signature = token.substring(lastDot + 1);
        if (!data || !signature)
            return false;
        const hmac = crypto.createHmac("sha256", this.secret);
        hmac.update(data);
        return signature === hmac.digest("hex").substring(0, 8);
    }
    hashPrescriptionContent(prescriptionText) {
        return crypto
            .createHash("sha256")
            .update(prescriptionText)
            .digest("hex")
            .substring(0, 12);
    }
    generateRegistrationQr(patientId) {
        return this.generateSecureToken(`PAT-${patientId}-${Date.now()}`);
    }
    generatePrescriptionToken(consultationId, prescriptionText, doctorId) {
        const expiry = Date.now() + 24 * 3600 * 1000;
        const cleanId = consultationId.replace(/-/g, "");
        let payload = `RX-${cleanId}-${expiry}`;
        if (prescriptionText) {
            const contentHash = this.hashPrescriptionContent(prescriptionText);
            payload += `-${contentHash}`;
        }
        if (doctorId) {
            const cleanDoctorId = doctorId.replace(/-/g, "");
            const doctorSig = this.signWithSecret(`${payload}-${cleanDoctorId}`);
            payload += `-DR-${cleanDoctorId}-${doctorSig}`;
        }
        return this.generateSecureToken(payload);
    }
    validatePrescriptionIntegrity(token, currentPrescriptionText) {
        if (!this.validateToken(token))
            return false;
        const lastDot = token.lastIndexOf(".");
        const data = token.substring(0, lastDot);
        const parts = data.split("-");
        const drIdx = parts.indexOf("DR");
        const hashPart = drIdx > 0 ? drIdx - 1 : parts.length - 1;
        if (hashPart < 3)
            return true;
        const embeddedHash = parts[hashPart];
        const currentHash = this.hashPrescriptionContent(currentPrescriptionText);
        return embeddedHash === currentHash;
    }
    extractDoctorId(token) {
        if (!this.validateToken(token))
            return null;
        const lastDot = token.lastIndexOf(".");
        const data = token.substring(0, lastDot);
        const parts = data.split("-");
        const drIdx = parts.indexOf("DR");
        if (drIdx < 0 || drIdx + 2 >= parts.length)
            return null;
        const cleanId = parts[drIdx + 1];
        if (cleanId.length === 32 && /^[0-9a-f]+$/.test(cleanId)) {
            return `${cleanId.substring(0, 8)}-${cleanId.substring(8, 12)}-${cleanId.substring(12, 16)}-${cleanId.substring(16, 20)}-${cleanId.substring(20)}`;
        }
        return cleanId;
    }
    generateConsentToken(patientId) {
        return this.generateSecureToken(`CONSENT-${patientId}-${Date.now() + 2 * 3600 * 1000}`);
    }
    generateRSAKeyPair() {
        const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
            modulusLength: 2048,
            publicKeyEncoding: { type: "spki", format: "pem" },
            privateKeyEncoding: { type: "pkcs8", format: "pem" },
        });
        return { publicKey, privateKey };
    }
    signWithSecret(data) {
        const hmac = crypto.createHmac("sha256", this.secret);
        hmac.update(data);
        return hmac.digest("hex").substring(0, 8);
    }
};
exports.QrService = QrService;
exports.QrService = QrService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], QrService);
//# sourceMappingURL=qr.service.js.map