import { UsersService } from "../users/users.service";
import { JwtService } from "@nestjs/jwt";
import { TelecomService } from "../telecom/telecom.service";
import { AppConfigService } from "../config/app-config.service";
import { TotpService } from "../common/totp.service";
export declare class AuthService {
    private usersService;
    private jwtService;
    private telecomService;
    private config;
    private totpService;
    constructor(usersService: UsersService, jwtService: JwtService, telecomService: TelecomService, config: AppConfigService, totpService: TotpService);
    register(registerDto: any): Promise<{
        user: any;
        access_token: string;
        refresh_token: string;
    } | {
        require2FA: boolean;
        userId: any;
        message: string;
    }>;
    validateUser(phone: string, pass: string): Promise<any>;
    login(user: any): Promise<{
        user: any;
        access_token: string;
        refresh_token: string;
    } | {
        require2FA: boolean;
        userId: any;
        message: string;
    }>;
    private generateTokensForUser;
    verify2FA(userId: string, otp: string): Promise<{
        user: any;
        access_token: string;
        refresh_token: string;
    }>;
    refreshToken(userId: string, refreshToken: string): Promise<{
        access_token: string;
        refresh_token: string;
    }>;
    refreshTokenFromRaw(refreshToken: string): Promise<{
        access_token: string;
        refresh_token: string;
    }>;
    logout(userId: string): Promise<void>;
    private getTokens;
    private updateRefreshToken;
    forgotPassword(phone: string): Promise<{
        message: string;
    }>;
    resetPassword(phone: string, otp: string, newPass: string): Promise<{
        message: string;
    }>;
    findOrCreateUserByPhone(phone: string): Promise<import("../users/entities/user.entity").User>;
    switchRole(userId: string, newRole: string): Promise<{
        user: any;
        access_token: string;
        refresh_token: string;
    }>;
    setupTOTP(userId: string): Promise<{
        secret: string;
        uri: string;
        backupCodes: string[];
    }>;
    verifyAndEnableTOTP(userId: string, token: string): Promise<{
        message: string;
    }>;
    disableTOTP(userId: string, token: string): Promise<{
        message: string;
    }>;
    loginWithBackupCode(userId: string, code: string): Promise<{
        user: any;
        access_token: string;
        refresh_token: string;
    }>;
}
