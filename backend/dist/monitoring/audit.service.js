"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const audit_log_entity_1 = require("../common/audit/entities/audit-log.entity");
let AuditService = class AuditService {
    constructor(auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }
    async findAll(limit = 50, offset = 0, severity) {
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
    mapActionToSeverity(action) {
        const critical = ["DELETE", "SUSPEND", "FORCE_LOGOUT"];
        const high = ["UPDATE", "VALIDATE", "AUTHORIZE"];
        const medium = ["CREATE", "LOGIN"];
        if (critical.includes(action))
            return "critical";
        if (high.includes(action))
            return "high";
        if (medium.includes(action))
            return "medium";
        return "low";
    }
};
exports.AuditService = AuditService;
exports.AuditService = AuditService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(audit_log_entity_1.AuditLog)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], AuditService);
//# sourceMappingURL=audit.service.js.map