"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var OtpService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OtpService = void 0;
const common_1 = require("@nestjs/common");
let OtpService = OtpService_1 = class OtpService {
    constructor() {
        this.logger = new common_1.Logger(OtpService_1.name);
        this.otpStorage = new Map();
        this.OTP_LENGTH = 6;
        this.OTP_VALIDITY_MINUTES = 10;
        this.MAX_ATTEMPTS = 5;
    }
    async generateAndSendOtp(phoneNumber, purpose = "PHONE_VERIFICATION") {
        const normalizedPhone = this.normalizePhoneNumber(phoneNumber);
        const recentOtps = Array.from(this.otpStorage.values()).filter((otp) => otp.phoneNumber === normalizedPhone &&
            otp.createdAt.getTime() > Date.now() - 60 * 60 * 1000);
        if (recentOtps.length >= 3) {
            throw new common_1.BadRequestException("Trop de demandes OTP. Veuillez réessayer dans 1 heure.");
        }
        const code = this.generateRandomCode();
        const now = new Date();
        const expiresAt = new Date(now.getTime() + this.OTP_VALIDITY_MINUTES * 60 * 1000);
        const otpRecord = {
            id: `${normalizedPhone}-${purpose}-${Date.now()}`,
            phoneNumber: normalizedPhone,
            code,
            purpose,
            isUsed: false,
            attempts: 0,
            createdAt: now,
            expiresAt,
        };
        this.otpStorage.set(otpRecord.id, otpRecord);
        this.logger.log(`OTP Generated: Phone=${normalizedPhone}, Purpose=${purpose}, Code=${code}`);
        return {
            code,
            expiresIn: this.OTP_VALIDITY_MINUTES * 60,
        };
    }
    async verifyOtp(phoneNumber, code, purpose = "PHONE_VERIFICATION") {
        const normalizedPhone = this.normalizePhoneNumber(phoneNumber);
        let otpRecord;
        for (const otp of this.otpStorage.values()) {
            if (otp.phoneNumber === normalizedPhone &&
                otp.purpose === purpose &&
                !otp.isUsed) {
                otpRecord = otp;
                break;
            }
        }
        if (!otpRecord) {
            throw new common_1.BadRequestException("Aucun OTP trouvé pour ce numéro.");
        }
        if (otpRecord.expiresAt < new Date()) {
            this.otpStorage.delete(otpRecord.id);
            throw new common_1.BadRequestException("OTP expiré. Veuillez en demander un nouveau.");
        }
        if (otpRecord.attempts >= this.MAX_ATTEMPTS) {
            this.otpStorage.delete(otpRecord.id);
            throw new common_1.BadRequestException("Trop de tentatives. OTP annulé. Veuillez en demander un nouveau.");
        }
        if (otpRecord.code !== code) {
            otpRecord.attempts++;
            throw new common_1.BadRequestException(`Code incorrect. ${this.MAX_ATTEMPTS - otpRecord.attempts} tentatives restantes.`);
        }
        otpRecord.isUsed = true;
        this.logger.log(`OTP Verified: Phone=${normalizedPhone}, Purpose=${purpose}`);
        return true;
    }
    async invalidateOtp(phoneNumber, purpose = "PHONE_VERIFICATION") {
        const normalizedPhone = this.normalizePhoneNumber(phoneNumber);
        for (const [id, otp] of this.otpStorage) {
            if (otp.phoneNumber === normalizedPhone && otp.purpose === purpose) {
                this.otpStorage.delete(id);
            }
        }
        this.logger.log(`OTP Invalidated: Phone=${normalizedPhone}`);
    }
    cleanupExpiredOtps() {
        const now = new Date();
        let count = 0;
        for (const [id, otp] of this.otpStorage) {
            if (otp.expiresAt < now) {
                this.otpStorage.delete(id);
                count++;
            }
        }
        if (count > 0) {
            this.logger.log(`Cleaned up ${count} expired OTPs`);
        }
        return count;
    }
    generateRandomCode() {
        return Math.floor(Math.random() * 10 ** this.OTP_LENGTH)
            .toString()
            .padStart(this.OTP_LENGTH, "0");
    }
    normalizePhoneNumber(phone) {
        let normalized = phone.replace(/\D/g, "");
        if (normalized.startsWith("226")) {
            normalized = "+" + normalized;
        }
        else if (normalized.startsWith("0")) {
            normalized = "+226" + normalized.substring(1);
        }
        else if (!normalized.startsWith("+")) {
            normalized = "+226" + normalized;
        }
        return normalized;
    }
};
exports.OtpService = OtpService;
exports.OtpService = OtpService = OtpService_1 = __decorate([
    (0, common_1.Injectable)()
], OtpService);
//# sourceMappingURL=otp.service.js.map