import { Repository } from "typeorm";
import { AuditLog } from "../common/audit/entities/audit-log.entity";
export declare class AuditService {
    private auditLogRepository;
    constructor(auditLogRepository: Repository<AuditLog>);
    findAll(limit?: number, offset?: number, severity?: string): Promise<{
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
    private mapActionToSeverity;
}
