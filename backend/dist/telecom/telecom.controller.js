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
exports.TelecomController = void 0;
const common_1 = require("@nestjs/common");
const telecom_service_1 = require("./telecom.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let TelecomController = class TelecomController {
    constructor(telecomService) {
        this.telecomService = telecomService;
    }
    async getVideoToken(room, req) {
        return this.telecomService.generateVideoToken(req.user.phone || req.user.userId, room);
    }
};
exports.TelecomController = TelecomController;
__decorate([
    (0, common_1.Post)("video-token"),
    __param(0, (0, common_1.Body)("room")),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TelecomController.prototype, "getVideoToken", null);
exports.TelecomController = TelecomController = __decorate([
    (0, common_1.Controller)("telecom"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [telecom_service_1.TelecomService])
], TelecomController);
//# sourceMappingURL=telecom.controller.js.map