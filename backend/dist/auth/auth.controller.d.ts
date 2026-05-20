import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { OtpService } from "../telecom/otp.service";
import { SmsService } from "../telecom/sms.service";
export declare class AuthController {
    private authService;
    private otpService;
    private smsService;
    private readonly logger;
    constructor(authService: AuthService, otpService: OtpService, smsService: SmsService);
    private errorMessage;
    login(loginDto: LoginDto): Promise<{
        user: any;
        access_token: string;
        refresh_token: string;
    } | {
        require2FA: boolean;
        userId: any;
        message: string;
    }>;
    requestOtp(body: {
        phoneNumber: string;
    }): Promise<{
        statusCode: number;
        success: boolean;
        message: string;
        expiresIn: number;
    }>;
    verifyOtp(body: {
        phoneNumber: string;
        code: string;
    }): Promise<{
        user: any;
        access_token: string;
        refresh_token: string;
        statusCode: number;
        success: boolean;
        message: string;
    } | {
        require2FA: boolean;
        userId: any;
        message: string;
        statusCode: number;
        success: boolean;
    }>;
    requestLoginOtp(body: {
        phoneNumber: string;
    }): Promise<{
        statusCode: number;
        success: boolean;
        message: string;
        expiresIn: number;
    }>;
    loginWithOtp(body: {
        phoneNumber: string;
        code: string;
    }): Promise<{
        user: any;
        access_token: string;
        refresh_token: string;
        statusCode: number;
        success: boolean;
        message: string;
    } | {
        require2FA: boolean;
        userId: any;
        message: string;
        statusCode: number;
        success: boolean;
    }>;
    verify2FA(body: {
        userId: string;
        otp: string;
    }): Promise<{
        user: any;
        access_token: string;
        refresh_token: string;
    }>;
    setupTOTP(req: any): Promise<{
        secret: string;
        uri: string;
        backupCodes: string[];
    }>;
    verifyTOTP(req: any, body: {
        token: string;
    }): Promise<{
        message: string;
    }>;
    disableTOTP(req: any, body: {
        token: string;
    }): Promise<{
        message: string;
    }>;
    backupCodeLogin(body: {
        userId: string;
        code: string;
    }): Promise<{
        user: any;
        access_token: string;
        refresh_token: string;
    }>;
    register(registerDto: RegisterDto): Promise<{
        user: any;
        access_token: string;
        refresh_token: string;
    } | {
        require2FA: boolean;
        userId: any;
        message: string;
    }>;
    refresh(body: {
        refreshToken: string;
    }): Promise<{
        access_token: string;
        refresh_token: string;
    }>;
    switchRole(req: any, body: {
        role: string;
    }): Promise<{
        user: any;
        access_token: string;
        refresh_token: string;
    }>;
    logout(req: any): Promise<void>;
    forgotPassword(body: {
        phone: string;
    }): Promise<{
        message: string;
    }>;
    resetPassword(body: {
        phone: string;
        otp: string;
        newPass: string;
    }): Promise<{
        message: string;
    }>;
}
