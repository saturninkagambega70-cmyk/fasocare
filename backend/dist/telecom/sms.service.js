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
var SmsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmsService = void 0;
const common_1 = require("@nestjs/common");
const telecom_service_1 = require("./telecom.service");
let SmsService = SmsService_1 = class SmsService {
    constructor(telecomService) {
        this.telecomService = telecomService;
        this.logger = new common_1.Logger(SmsService_1.name);
    }
    async send(recipients, message) {
        const recipientList = Array.isArray(recipients) ? recipients : [recipients];
        let lastResult = { status: "FAILED" };
        for (const recipient of recipientList) {
            try {
                const result = await this.telecomService.sendSms(recipient, message);
                lastResult = (result || { status: "FAILED" });
            }
            catch (error) {
                this.logger.error(`SMS send failed for ${recipient?.slice(0, 4)}****`);
                lastResult = { status: "FAILED" };
            }
        }
        return lastResult;
    }
    async sendOtp(phoneNumber, code) {
        const message = `Votre code de vérification FasoCare est: ${code}\nCode valide 10 minutes.\nNe le partagez avec personne.`;
        await this.send(phoneNumber, message);
    }
    async sendAppointmentConfirmation(phoneNumber, data) {
        const message = `RDV CONFIRME - FasoCare\n\nReference: ${data.referenceCode}\nEtablissement: ${data.facilityName}\nDate: ${data.date}${data.time ? `\nHeure: ${data.time}` : ""}`;
        await this.send(phoneNumber, message);
    }
    async sendHealthAlert(phoneNumber, data) {
        const fullMessage = `${data.title}\n\n${data.message}${data.actionUrl ? `\n\nPlus d'informations: ${data.actionUrl}` : ""}`;
        await this.send(phoneNumber, fullMessage);
    }
    async broadcast(recipients, message) {
        this.logger.log(`Broadcast SMS to ${recipients.length} recipients`);
        return this.send(recipients, message);
    }
};
exports.SmsService = SmsService;
exports.SmsService = SmsService = SmsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [telecom_service_1.TelecomService])
], SmsService);
//# sourceMappingURL=sms.service.js.map