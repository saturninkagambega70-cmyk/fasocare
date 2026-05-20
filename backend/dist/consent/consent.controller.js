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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsentController = void 0;
const common_1 = require("@nestjs/common");
const consent_service_1 = require("./consent.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const swagger_1 = require("@nestjs/swagger");
let ConsentController = class ConsentController {
    constructor(consentService) {
        this.consentService = consentService;
    }
    grantConsent(req, body) {
        const metadata = {
            ip: req.ip,
            userAgent: req.get("user-agent"),
        };
        return this.consentService.grantConsent(req.user.userId, body.consentType, metadata);
    }
    revokeConsent(req, body) {
        return this.consentService.revokeConsent(req.user.userId, body.consentType);
    }
    getMyConsents(req) {
        return this.consentService.getPatientConsents(req.user.userId);
    }
    deleteAccount(req) {
        return this.consentService.requestDataDeletion(req.user.userId);
    }
};
exports.ConsentController = ConsentController;
__decorate([
    (0, common_1.Post)("grant"),
    (0, swagger_1.ApiOperation)({ summary: "Grant a specific consent" }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ConsentController.prototype, "grantConsent", null);
__decorate([
    (0, common_1.Post)("revoke"),
    (0, swagger_1.ApiOperation)({ summary: "Revoke a specific consent" }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ConsentController.prototype, "revokeConsent", null);
__decorate([
    (0, common_1.Get)("my-consents"),
    (0, swagger_1.ApiOperation)({ summary: "Get all consents for the current user" }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ConsentController.prototype, "getMyConsents", null);
__decorate([
    (0, common_1.Delete)("delete-account"),
    (0, swagger_1.ApiOperation)({
        summary: "Request full data deletion (Right to be Forgotten)",
    }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ConsentController.prototype, "deleteAccount", null);
exports.ConsentController = ConsentController = __decorate([
    (0, swagger_1.ApiTags)("consent"),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)("consent"),
    __metadata("design:paramtypes", [consent_service_1.ConsentService])
], ConsentController);
//# sourceMappingURL=consent.controller.js.map