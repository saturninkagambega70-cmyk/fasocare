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
var EncryptionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EncryptionService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const CryptoJS = __importStar(require("crypto-js"));
let EncryptionService = EncryptionService_1 = class EncryptionService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(EncryptionService_1.name);
        this.masterKey = this.configService.get("ENCRYPTION_KEY") || "";
        if (this.masterKey.length < 32) {
            this.logger.warn("ENCRYPTION_KEY doit être d'au moins 32 caractères en production !");
            if (process.env.NODE_ENV !== "production") {
                this.masterKey = "dev-key-32-chars-long-for-testing-!";
            }
        }
    }
    encrypt(value) {
        if (!value)
            return value;
        try {
            return CryptoJS.AES.encrypt(value, this.masterKey).toString();
        }
        catch (error) {
            this.logger.error("Erreur chiffrement:", error);
            throw new Error("Encryption failed");
        }
    }
    decrypt(encryptedValue) {
        if (!encryptedValue)
            return encryptedValue;
        try {
            const bytes = CryptoJS.AES.decrypt(encryptedValue, this.masterKey);
            return bytes.toString(CryptoJS.enc.Utf8);
        }
        catch (error) {
            this.logger.error("Erreur déchiffrement:", error);
            throw new Error("Decryption failed - data may be corrupted");
        }
    }
    maskPhone(phone) {
        if (!phone || phone.length < 8)
            return phone;
        return phone.slice(0, 4) + " ** ** " + phone.slice(-2);
    }
    hashForSearch(value) {
        return CryptoJS.SHA256(value + this.masterKey).toString();
    }
};
exports.EncryptionService = EncryptionService;
exports.EncryptionService = EncryptionService = EncryptionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], EncryptionService);
//# sourceMappingURL=encryption.service.js.map