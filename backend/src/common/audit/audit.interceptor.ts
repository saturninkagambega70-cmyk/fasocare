import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { AuditLog } from "./entities/audit-log.entity";

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditInterceptor.name);

  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;

    // Only log write operations
    if (!["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
      return next.handle();
    }

    const { user, body, url, ip } = request;
    const userAgent = request.get("user-agent");

    return next.handle().pipe(
      tap(async (data) => {
        try {
          const auditLog = new AuditLog();
          auditLog.userId = user?.userId || user?.id;
          auditLog.action = method;
          auditLog.resource = url;
          auditLog.resourceId = data?.id || body?.id;
          auditLog.payload = this.sanitizePayload(body);
          auditLog.ipAddress = ip;
          auditLog.userAgent = userAgent;

          await this.auditLogRepository.save(auditLog);
          this.logger.log(
            `Audit: ${method} ${url} by user ${user?.userId || user?.id || "anonymous"} - ResourceID: ${auditLog.resourceId}`,
          );
        } catch (error) {
          this.logger.error("Failed to save audit log", error);
        }
      }),
    );
  }

  private sanitizePayload(payload: any): any {
    if (!payload) return payload;
    const sanitized = { ...payload };
    const sensitiveFields = [
      "password",
      "newPass",
      "token",
      "refreshToken",
      "otp",
      "resetPasswordOTP",
      "twoFAOTP",
      "passwordHash",
      "refreshTokenHash",
      "authorization",
    ];

    sensitiveFields.forEach((field) => {
      if (field in sanitized) {
        sanitized[field] = "***";
      }
    });

    return sanitized;
  }
}
