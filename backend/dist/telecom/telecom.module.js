"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelecomModule = void 0;
const common_1 = require("@nestjs/common");
const telecom_service_1 = require("./telecom.service");
const telecom_controller_1 = require("./telecom.controller");
const otp_service_1 = require("./otp.service");
const sms_service_1 = require("./sms.service");
let TelecomModule = class TelecomModule {
};
exports.TelecomModule = TelecomModule;
exports.TelecomModule = TelecomModule = __decorate([
    (0, common_1.Module)({
        imports: [],
        providers: [telecom_service_1.TelecomService, otp_service_1.OtpService, sms_service_1.SmsService],
        controllers: [telecom_controller_1.TelecomController],
        exports: [telecom_service_1.TelecomService, otp_service_1.OtpService, sms_service_1.SmsService],
    })
], TelecomModule);
//# sourceMappingURL=telecom.module.js.map