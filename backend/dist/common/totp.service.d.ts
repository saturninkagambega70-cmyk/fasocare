export declare class TotpService {
    generateSecret(): string;
    generateTOTP(secret: string, window?: number): string;
    verifyTOTP(token: string, secret: string, windows?: number): boolean;
    getProvisioningUri(secret: string, email: string, issuer?: string): string;
    generateBackupCodes(count?: number): string[];
}
