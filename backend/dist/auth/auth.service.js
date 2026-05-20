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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("../users/users.service");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcrypt"));
const telecom_service_1 = require("../telecom/telecom.service");
const app_config_service_1 = require("../config/app-config.service");
const user_entity_1 = require("../users/entities/user.entity");
const totp_service_1 = require("../common/totp.service");
let AuthService = class AuthService {
    constructor(usersService, jwtService, telecomService, config, totpService) {
        this.usersService = usersService;
        this.jwtService = jwtService;
        this.telecomService = telecomService;
        this.config = config;
        this.totpService = totpService;
    }
    async register(registerDto) {
        const existingUser = await this.usersService.findOneByPhone(registerDto.phone);
        if (existingUser) {
            if (!existingUser.name) {
                const passwordHash = await bcrypt.hash(registerDto.password, 10);
                const roles = registerDto.roles?.length
                    ? registerDto.roles
                    : [registerDto.role || user_entity_1.UserRole.PATIENT];
                await this.usersService.update(existingUser.id, {
                    passwordHash,
                    name: registerDto.name || null,
                    gender: registerDto.gender || null,
                    bloodGroup: registerDto.bloodGroup || null,
                    roles,
                    activeRole: roles[0],
                    licenseNumber: registerDto.licenseNumber || null,
                    isVerified: roles.every((r) => r === user_entity_1.UserRole.PATIENT || r === user_entity_1.UserRole.PARENT)
                        ? this.config.enableAutoVerification
                        : false,
                });
                const updated = await this.usersService.findById(existingUser.id);
                return this.login(updated);
            }
            throw new common_1.ConflictException("Ce numéro est déjà enregistré.");
        }
        const passwordHash = await bcrypt.hash(registerDto.password, 10);
        const roles = registerDto.roles?.length
            ? registerDto.roles
            : [registerDto.role || user_entity_1.UserRole.PATIENT];
        const newUser = await this.usersService.create({
            phone: registerDto.phone,
            passwordHash,
            name: registerDto.name || null,
            gender: registerDto.gender || null,
            bloodGroup: registerDto.bloodGroup || null,
            roles,
            activeRole: roles[0],
            licenseNumber: registerDto.licenseNumber || null,
            isVerified: roles.every((r) => r === user_entity_1.UserRole.PATIENT || r === user_entity_1.UserRole.PARENT)
                ? this.config.enableAutoVerification
                : false,
        });
        return this.login(newUser);
    }
    async validateUser(phone, pass) {
        const user = await this.usersService.findOneByPhoneWithSecurityFields(phone);
        if (user && (await bcrypt.compare(pass, user.passwordHash))) {
            const { passwordHash, ...result } = user;
            return result;
        }
        return null;
    }
    async login(user) {
        if (user.is2FAEnabled) {
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            const expiry = new Date();
            expiry.setMinutes(expiry.getMinutes() + 5);
            await this.usersService.update(user.id, {
                twoFAOTP: otp,
                twoFAOTPExpiry: expiry,
            });
            await this.telecomService.sendSms(user.phone, `[FasoCare] Votre code de sécurité 2FA est : ${otp}. Valide 5 mins.`);
            return {
                require2FA: true,
                userId: user.id,
                message: "Un code 2FA a été envoyé par SMS.",
            };
        }
        return this.generateTokensForUser(user);
    }
    async generateTokensForUser(user) {
        const roles = user.roles || [user.role || user_entity_1.UserRole.PATIENT];
        const activeRole = user.activeRole || roles[0];
        const payload = {
            phone: user.phone,
            sub: user.id,
            roles,
            role: activeRole,
            activeRole,
            isVerified: user.isVerified !== false,
        };
        const tokens = await this.getTokens(payload);
        await this.updateRefreshToken(user.id, tokens.refresh_token);
        const { passwordHash, refreshTokenHash, resetPasswordOTP, twoFAOTP, ...userProfile } = user;
        return {
            ...tokens,
            user: userProfile,
        };
    }
    async verify2FA(userId, otp) {
        const user = await this.usersService.findByIdWithSecurityFields(userId);
        if (!user || user.twoFAOTP !== otp) {
            throw new common_1.UnauthorizedException("Code 2FA invalide");
        }
        if (new Date() > user.twoFAOTPExpiry) {
            throw new common_1.UnauthorizedException("Code 2FA expiré");
        }
        await this.usersService.update(userId, {
            twoFAOTP: null,
            twoFAOTPExpiry: null,
        });
        return this.generateTokensForUser(user);
    }
    async refreshToken(userId, refreshToken) {
        const user = await this.usersService.findByIdWithSecurityFields(userId);
        if (!user || !user.refreshTokenHash) {
            throw new common_1.UnauthorizedException("Accès refusé");
        }
        const refreshTokenMatches = await bcrypt.compare(refreshToken, user.refreshTokenHash);
        if (!refreshTokenMatches) {
            throw new common_1.UnauthorizedException("Token invalide");
        }
        const roles = user.roles?.length ? user.roles : [user_entity_1.UserRole.PATIENT];
        const tokens = await this.getTokens({
            phone: user.phone,
            sub: user.id,
            roles,
            role: user.activeRole || roles[0],
            activeRole: user.activeRole || roles[0],
            isVerified: user.isVerified !== false,
        });
        await this.updateRefreshToken(user.id, tokens.refresh_token);
        return tokens;
    }
    async refreshTokenFromRaw(refreshToken) {
        let payload;
        try {
            payload = await this.jwtService.verifyAsync(refreshToken, {
                secret: this.config.jwtRefreshSecret,
            });
        }
        catch {
            throw new common_1.UnauthorizedException("Refresh token invalide");
        }
        if (!payload?.sub) {
            throw new common_1.UnauthorizedException("Refresh token invalide");
        }
        return this.refreshToken(payload.sub, refreshToken);
    }
    async logout(userId) {
        await this.usersService.update(userId, { refreshTokenHash: null });
    }
    async getTokens(payload) {
        const [at, rt] = await Promise.all([
            this.jwtService.signAsync(payload, {
                secret: this.config.jwtSecret,
                expiresIn: this.config.jwtAccessExpiration,
            }),
            this.jwtService.signAsync(payload, {
                secret: this.config.jwtRefreshSecret,
                expiresIn: this.config.jwtRefreshExpiration,
            }),
        ]);
        return {
            access_token: at,
            refresh_token: rt,
        };
    }
    async updateRefreshToken(userId, refreshToken) {
        const hash = await bcrypt.hash(refreshToken, 10);
        await this.usersService.update(userId, { refreshTokenHash: hash });
    }
    async forgotPassword(phone) {
        const user = await this.usersService.findOneByPhoneWithSecurityFields(phone);
        if (!user)
            return { message: "Si le numéro existe, un SMS sera envoyé." };
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiry = new Date();
        expiry.setMinutes(expiry.getMinutes() + 15);
        await this.usersService.update(user.id, {
            resetPasswordOTP: otp,
            resetPasswordOTPExpiry: expiry,
        });
        await this.telecomService.sendSms(phone, `[FasoCare] Votre code de réinitialisation est : ${otp}. Valide 15 mins.`);
        return { message: "SMS envoyé." };
    }
    async resetPassword(phone, otp, newPass) {
        const user = await this.usersService.findOneByPhoneWithSecurityFields(phone);
        if (!user || user.resetPasswordOTP !== otp) {
            throw new common_1.UnauthorizedException("Code invalide ou utilisateur inconnu");
        }
        if (new Date() > user.resetPasswordOTPExpiry) {
            throw new common_1.UnauthorizedException("Code expiré");
        }
        const passwordHash = await bcrypt.hash(newPass, 10);
        await this.usersService.update(user.id, {
            passwordHash,
            resetPasswordOTP: null,
            resetPasswordOTPExpiry: null,
        });
        return { message: "Mot de passe mis à jour." };
    }
    async findOrCreateUserByPhone(phone) {
        let user = await this.usersService.findOneByPhone(phone);
        if (!user) {
            const randomPassword = Math.random().toString(36).slice(-32);
            const passwordHash = await bcrypt.hash(randomPassword, 10);
            user = await this.usersService.create({
                phone,
                passwordHash,
                roles: [user_entity_1.UserRole.PATIENT],
                activeRole: user_entity_1.UserRole.PATIENT,
                isVerified: true,
                name: null,
                gender: null,
                licenseNumber: null,
            });
        }
        return user;
    }
    async switchRole(userId, newRole) {
        const user = await this.usersService.findById(userId);
        const roles = user.roles?.length ? user.roles : [user_entity_1.UserRole.PATIENT];
        const role = newRole;
        if (!roles.includes(role)) {
            throw new common_1.UnauthorizedException("Vous ne possédez pas ce rôle.");
        }
        return this.generateTokensForUser({ ...user, activeRole: role, roles });
    }
    async setupTOTP(userId) {
        const user = await this.usersService.findByIdWithSecurityFields(userId);
        if (!user)
            throw new common_1.UnauthorizedException("Utilisateur non trouvé");
        const secret = this.totpService.generateSecret();
        const backupCodes = this.totpService.generateBackupCodes(8);
        const uri = this.totpService.getProvisioningUri(secret, userId);
        await this.usersService.update(userId, {
            totpSecret: secret,
            backupCodes,
        });
        return { secret, uri, backupCodes };
    }
    async verifyAndEnableTOTP(userId, token) {
        const user = await this.usersService.findByIdWithSecurityFields(userId);
        if (!user || !user.totpSecret)
            throw new common_1.BadRequestException("TOTP non configuré");
        if (!this.totpService.verifyTOTP(token, user.totpSecret)) {
            throw new common_1.UnauthorizedException("Code invalide");
        }
        await this.usersService.update(userId, { is2FAEnabled: true });
        return { message: "2FA TOTP activé avec succès" };
    }
    async disableTOTP(userId, token) {
        const user = await this.usersService.findByIdWithSecurityFields(userId);
        if (!user || !user.totpSecret)
            throw new common_1.BadRequestException("TOTP non configuré");
        if (!this.totpService.verifyTOTP(token, user.totpSecret)) {
            throw new common_1.UnauthorizedException("Code invalide");
        }
        await this.usersService.update(userId, {
            is2FAEnabled: false,
            totpSecret: null,
            backupCodes: null,
        });
        return { message: "2FA TOTP désactivé" };
    }
    async loginWithBackupCode(userId, code) {
        const user = await this.usersService.findByIdWithSecurityFields(userId);
        if (!user || !user.backupCodes)
            throw new common_1.UnauthorizedException("Aucun code de secours");
        const codes = Array.isArray(user.backupCodes)
            ? user.backupCodes
            : [user.backupCodes];
        const idx = codes.indexOf(code.toUpperCase());
        if (idx === -1)
            throw new common_1.UnauthorizedException("Code de secours invalide");
        codes.splice(idx, 1);
        await this.usersService.update(userId, { backupCodes: codes });
        return this.generateTokensForUser(user);
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService,
        telecom_service_1.TelecomService,
        app_config_service_1.AppConfigService,
        totp_service_1.TotpService])
], AuthService);
//# sourceMappingURL=auth.service.js.map