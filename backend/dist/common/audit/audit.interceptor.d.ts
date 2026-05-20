import { NestInterceptor, ExecutionContext, CallHandler } from "@nestjs/common";
import { Observable } from "rxjs";
import { Repository } from "typeorm";
import { AuditLog } from "./entities/audit-log.entity";
export declare class AuditInterceptor implements NestInterceptor {
    private auditLogRepository;
    private readonly logger;
    constructor(auditLogRepository: Repository<AuditLog>);
    intercept(context: ExecutionContext, next: CallHandler): Observable<any>;
    private sanitizePayload;
}
