import { User } from "../../users/entities/user.entity";
export declare class Consent {
    id: string;
    patient: User;
    consentType: string;
    isGranted: boolean;
    grantedAt: Date;
    revokedAt: Date;
    ipAddress: string;
    userAgent: string;
    createdAt: Date;
    updatedAt: Date;
}
