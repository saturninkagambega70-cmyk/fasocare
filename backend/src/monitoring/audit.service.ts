import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AuditLog } from "../common/audit/entities/audit-log.entity";

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
  ) {}

  async findAll(limit = 50, offset = 0, severity?: string) {
    const [logs, total] = await this.auditLogRepository.findAndCount({
      relations: ["user"],
      order: { timestamp: "DESC" },
      take: limit,
      skip: offset,
    });

    return {
      statusCode: 200,
      success: true,
      data: {
        logs: logs.map((log) => ({
          id: log.id,
          action: log.action,
          userId: log.userId,
          userName: log.user?.name || "Système",
          userRole: log.user?.roles?.[0] || "N/A",
          resource: log.resource,
          details: log.payload
            ? JSON.stringify(log.payload).substring(0, 100)
            : "Aucun détail",
          ipAddress: log.ipAddress || "Inconnue",
          severity: this.mapActionToSeverity(log.action),
          timestamp: log.timestamp.toISOString(),
        })),
        total,
      },
    };
  }

  private mapActionToSeverity(action: string): string {
    const critical = ["DELETE", "SUSPEND", "FORCE_LOGOUT"];
    const high = ["UPDATE", "VALIDATE", "AUTHORIZE"];
    const medium = ["CREATE", "LOGIN"];

    if (critical.includes(action)) return "critical";
    if (high.includes(action)) return "high";
    if (medium.includes(action)) return "medium";
    return "low";
  }
}
