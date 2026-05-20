import { AuditService } from "./audit.service";
export declare class MonitoringController {
    private readonly auditService;
    constructor(auditService: AuditService);
    getAuditLogs(limit?: number, offset?: number, severity?: string): Promise<{
        statusCode: number;
        success: boolean;
        data: {
            logs: {
                id: string;
                action: string;
                userId: string;
                userName: string;
                userRole: string;
                resource: string;
                details: string;
                ipAddress: string;
                severity: string;
                timestamp: string;
            }[];
            total: number;
        };
    }>;
}
