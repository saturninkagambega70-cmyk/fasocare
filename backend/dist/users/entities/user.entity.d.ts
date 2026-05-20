export declare enum UserRole {
    ADMIN = "ADMIN",
    DOCTOR = "DOCTOR",
    PHARMACIST = "PHARMACIST",
    PARENT = "PARENT",
    PATIENT = "PATIENT",
    HEALTH_MINISTRY = "HEALTH_MINISTRY",
    INSPECTOR = "INSPECTOR",
    LEGAL_AUTHORITY = "LEGAL_AUTHORITY",
    LAB_TECHNICIAN = "LAB_TECHNICIAN"
}
export declare class User {
    id: string;
    parent: User;
    children: User[];
    phone: string;
    phoneHash: string;
    name: string;
    gender: string;
    bloodGroup: string;
    passwordHash: string;
    refreshTokenHash: string;
    roles: UserRole[];
    activeRole: UserRole;
    licenseNumber: string;
    publicKey: string;
    isVerified: boolean;
    createdAt: Date;
    resetPasswordOTP: string;
    resetPasswordOTPExpiry: Date;
    is2FAEnabled: boolean;
    twoFAOTP: string;
    twoFAOTPExpiry: Date;
    totpSecret: string;
    backupCodes: string[];
    hashFields(): void;
}
