export declare class OtpService {
    private readonly logger;
    private otpStorage;
    private readonly OTP_LENGTH;
    private readonly OTP_VALIDITY_MINUTES;
    private readonly MAX_ATTEMPTS;
    generateAndSendOtp(phoneNumber: string, purpose?: "PHONE_VERIFICATION" | "LOGIN" | "PASSWORD_RESET" | "TRANSACTION"): Promise<{
        code: string;
        expiresIn: number;
    }>;
    verifyOtp(phoneNumber: string, code: string, purpose?: "PHONE_VERIFICATION" | "LOGIN" | "PASSWORD_RESET" | "TRANSACTION"): Promise<boolean>;
    invalidateOtp(phoneNumber: string, purpose?: "PHONE_VERIFICATION" | "LOGIN" | "PASSWORD_RESET" | "TRANSACTION"): Promise<void>;
    cleanupExpiredOtps(): number;
    private generateRandomCode;
    private normalizePhoneNumber;
}
