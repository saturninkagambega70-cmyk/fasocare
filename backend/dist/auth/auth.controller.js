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
var AuthController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const throttler_1 = require("@nestjs/throttler");
const auth_service_1 = require("./auth.service");
const login_dto_1 = require("./dto/login.dto");
const register_dto_1 = require("./dto/register.dto");
const jwt_auth_guard_1 = require("./jwt-auth.guard");
const otp_service_1 = require("../telecom/otp.service");
const sms_service_1 = require("../telecom/sms.service");
let AuthController = AuthController_1 = class AuthController {
    constructor(authService, otpService, smsService) {
        this.authService = authService;
        this.otpService = otpService;
        this.smsService = smsService;
        this.logger = new common_1.Logger(AuthController_1.name);
    }
    errorMessage(error) {
        return error instanceof Error ? error.message : "Erreur interne";
    }
    async login(loginDto) {
        const user = await this.authService.validateUser(loginDto.phone, loginDto.password);
        if (!user) {
            throw new common_1.UnauthorizedException("Identifiants invalides");
        }
        return this.authService.login(user);
    }
    async requestOtp(body) {
        try {
            const result = await this.otpService.generateAndSendOtp(body.phoneNumber, "PHONE_VERIFICATION");
            await this.smsService.sendOtp(body.phoneNumber, result.code);
            this.logger.log(`OTP requested for phone: ${body.phoneNumber}`);
            return {
                statusCode: 201,
                success: true,
                message: "Code de vérification envoyé à votre téléphone",
                expiresIn: result.expiresIn,
            };
        }
        catch (error) {
            const message = this.errorMessage(error);
            this.logger.error(`OTP request error: ${message}`);
            throw new common_1.BadRequestException(message);
        }
    }
    async verifyOtp(body) {
        try {
            const verified = await this.otpService.verifyOtp(body.phoneNumber, body.code, "PHONE_VERIFICATION");
            if (!verified) {
                throw new common_1.UnauthorizedException("Code de vérification invalide");
            }
            this.logger.log(`OTP verified for phone: ${body.phoneNumber}`);
            const user = await this.authService.findOrCreateUserByPhone(body.phoneNumber);
            const tokens = await this.authService.login(user);
            return {
                statusCode: 200,
                success: true,
                message: "Téléphone vérifié avec succès",
                ...tokens,
            };
        }
        catch (error) {
            const message = this.errorMessage(error);
            this.logger.error(`OTP verification error: ${message}`);
            throw new common_1.BadRequestException(message);
        }
    }
    async requestLoginOtp(body) {
        try {
            const result = await this.otpService.generateAndSendOtp(body.phoneNumber, "LOGIN");
            await this.smsService.sendOtp(body.phoneNumber, result.code);
            this.logger.log(`Login OTP requested for phone: ${body.phoneNumber}`);
            return {
                statusCode: 201,
                success: true,
                message: "Code de connexion envoyé à votre téléphone",
                expiresIn: result.expiresIn,
            };
        }
        catch (error) {
            const message = this.errorMessage(error);
            this.logger.error(`Login OTP request error: ${message}`);
            throw new common_1.BadRequestException(message);
        }
    }
    async loginWithOtp(body) {
        try {
            const verified = await this.otpService.verifyOtp(body.phoneNumber, body.code, "LOGIN");
            if (!verified) {
                throw new common_1.UnauthorizedException("Code de connexion invalide");
            }
            this.logger.log(`User logged in via OTP: ${body.phoneNumber}`);
            const user = await this.authService.findOrCreateUserByPhone(body.phoneNumber);
            const tokens = await this.authService.login(user);
            return {
                statusCode: 200,
                success: true,
                message: "Connecté avec succès",
                ...tokens,
            };
        }
        catch (error) {
            const message = this.errorMessage(error);
            this.logger.error(`Login OTP error: ${message}`);
            throw new common_1.BadRequestException(message);
        }
    }
    async verify2FA(body) {
        return this.authService.verify2FA(body.userId, body.otp);
    }
    async setupTOTP(req) {
        return this.authService.setupTOTP(req.user.userId);
    }
    async verifyTOTP(req, body) {
        return this.authService.verifyAndEnableTOTP(req.user.userId, body.token);
    }
    async disableTOTP(req, body) {
        return this.authService.disableTOTP(req.user.userId, body.token);
    }
    async backupCodeLogin(body) {
        return this.authService.loginWithBackupCode(body.userId, body.code);
    }
    async register(registerDto) {
        return this.authService.register(registerDto);
    }
    async refresh(body) {
        return this.authService.refreshTokenFromRaw(body.refreshToken);
    }
    async switchRole(req, body) {
        const user = await this.authService.switchRole(req.user.userId, body.role);
        return user;
    }
    async logout(req) {
        return this.authService.logout(req.user.userId);
    }
    async forgotPassword(body) {
        return this.authService.forgotPassword(body.phone);
    }
    async resetPassword(body) {
        return this.authService.resetPassword(body.phone, body.otp, body.newPass);
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)("login"),
    (0, throttler_1.Throttle)({ default: { limit: 5, ttl: 60000 } }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.LoginDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)("request-otp"),
    (0, throttler_1.Throttle)({ default: { limit: 3, ttl: 60000 } }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "requestOtp", null);
__decorate([
    (0, common_1.Post)("verify-otp"),
    (0, throttler_1.Throttle)({ default: { limit: 5, ttl: 60000 } }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyOtp", null);
__decorate([
    (0, common_1.Post)("request-login-otp"),
    (0, throttler_1.Throttle)({ default: { limit: 3, ttl: 60000 } }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "requestLoginOtp", null);
__decorate([
    (0, common_1.Post)("login-otp"),
    (0, throttler_1.Throttle)({ default: { limit: 5, ttl: 60000 } }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "loginWithOtp", null);
__decorate([
    (0, common_1.Post)("verify-2fa"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verify2FA", null);
__decorate([
    (0, common_1.Post)("totp/setup"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "setupTOTP", null);
__decorate([
    (0, common_1.Post)("totp/verify"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyTOTP", null);
__decorate([
    (0, common_1.Post)("totp/disable"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "disableTOTP", null);
__decorate([
    (0, common_1.Post)("totp/backup-login"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "backupCodeLogin", null);
__decorate([
    (0, common_1.Post)("register"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_dto_1.RegisterDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.Post)("refresh"),
    (0, throttler_1.Throttle)({ default: { limit: 5, ttl: 60000 } }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refresh", null);
__decorate([
    (0, common_1.Post)("switch-role"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, throttler_1.Throttle)({ default: { limit: 10, ttl: 60000 } }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "switchRole", null);
__decorate([
    (0, common_1.Post)("logout"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    (0, common_1.Post)("forgot-password"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "forgotPassword", null);
__decorate([
    (0, common_1.Post)("reset-password"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "resetPassword", null);
exports.AuthController = AuthController = AuthController_1 = __decorate([
    (0, common_1.Controller)("auth"),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        otp_service_1.OtpService,
        sms_service_1.SmsService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map