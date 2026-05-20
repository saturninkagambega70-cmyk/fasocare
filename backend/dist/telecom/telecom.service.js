"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelecomService = void 0;
const common_1 = require("@nestjs/common");
const AfricasTalkingModule = require("africastalking");
const AfricasTalking = AfricasTalkingModule.default || AfricasTalkingModule;
let TelecomService = class TelecomService {
    constructor() {
        try {
            this.at = AfricasTalking({
                apiKey: process.env.AT_API_KEY || "",
                username: process.env.AT_USERNAME || "",
            });
        }
        catch (e) {
            console.warn("[TelecomService] AfricasTalking init failed (sandbox mode):", e.message);
            this.at = null;
        }
    }
    async sendSms(to, message) {
        console.log(`Sending SMS via Africa's Talking to ${to?.slice(0, 4)}****`);
        try {
            if (!this.at?.SMS) {
                throw new Error("SMS provider not configured");
            }
            const result = await this.at.SMS.send({
                to: [to],
                message,
                from: "FasoCare_BF",
            });
            return result;
        }
        catch (error) {
            console.error("SMS Gateway Error:", error);
            return { status: "FAILED", error };
        }
    }
    async generateVideoToken(identity, room) {
        console.log(`Generating video token for room ${room}`);
        return {
            identity,
            room,
            token: `mock_twilio_token_for_${identity}_${Date.now()}`,
        };
    }
};
exports.TelecomService = TelecomService;
exports.TelecomService = TelecomService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], TelecomService);
//# sourceMappingURL=telecom.service.js.map