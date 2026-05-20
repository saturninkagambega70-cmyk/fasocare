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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var UssdController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UssdController = void 0;
const common_1 = require("@nestjs/common");
const ussd_service_1 = require("./ussd.service");
let UssdController = UssdController_1 = class UssdController {
    constructor(ussdService) {
        this.ussdService = ussdService;
        this.logger = new common_1.Logger(UssdController_1.name);
    }
    errorMessage(error) {
        return error instanceof Error ? error.message : "Erreur interne";
    }
    async handleUssd(body) {
        const { phoneNumber, text, sessionId } = body;
        this.logger.debug(`USSD Request: Phone=${phoneNumber}, Text="${text}", SessionId=${sessionId}`);
        try {
            const response = await this.ussdService.processUssd(phoneNumber, text, sessionId);
            this.logger.debug(`USSD Response: ${response}`);
            return {
                message: response,
            };
        }
        catch (error) {
            const message = this.errorMessage(error);
            const stack = error instanceof Error ? error.stack : undefined;
            this.logger.error(`USSD Error: ${message}`, stack);
            return {
                message: "END Erreur système. Veuillez réessayer plus tard.",
            };
        }
    }
    async testUssd(body) {
        const { phoneNumber, text = "", sessionId = `test-${Date.now()}` } = body;
        this.logger.log(`Test USSD: Phone=${phoneNumber}, Text="${text}"`);
        try {
            const response = await this.ussdService.processUssd(phoneNumber, text, sessionId);
            return {
                message: response,
            };
        }
        catch (error) {
            const message = this.errorMessage(error);
            this.logger.error(`Test USSD Error: ${message}`);
            return {
                message: "END Erreur de test.",
            };
        }
    }
};
exports.UssdController = UssdController;
__decorate([
    (0, common_1.Post)("callback"),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UssdController.prototype, "handleUssd", null);
__decorate([
    (0, common_1.Post)("test"),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UssdController.prototype, "testUssd", null);
exports.UssdController = UssdController = UssdController_1 = __decorate([
    (0, common_1.Controller)("ussd"),
    __metadata("design:paramtypes", [ussd_service_1.UssdService])
], UssdController);
//# sourceMappingURL=ussd.controller.js.map