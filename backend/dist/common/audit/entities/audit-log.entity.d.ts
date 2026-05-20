import { User } from "../../../users/entities/user.entity";
export declare class AuditLog {
    id: string;
    user: User;
    userId: string;
    action: string;
    resource: string;
    resourceId: string;
    payload: any;
    ipAddress: string;
    userAgent: string;
    timestamp: Date;
}
