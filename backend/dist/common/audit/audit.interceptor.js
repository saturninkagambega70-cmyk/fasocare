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
var AuditInterceptor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
const typeorm_1 = require("typeorm");
const typeorm_2 = require("@nestjs/typeorm");
const audit_log_entity_1 = require("./entities/audit-log.entity");
let AuditInterceptor = AuditInterceptor_1 = class AuditInterceptor {
    constructor(auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
        this.logger = new common_1.Logger(AuditInterceptor_1.name);
    }
    intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        const method = request.method;
        if (!["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
            return next.handle();
        }
        const { user, body, url, ip } = request;
        const userAgent = request.get("user-agent");
        return next.handle().pipe((0, operators_1.tap)(async (data) => {
            try {
                const auditLog = new audit_log_entity_1.AuditLog();
                auditLog.userId = user?.userId || user?.id;
                auditLog.action = method;
                auditLog.resource = url;
                auditLog.resourceId = data?.id || body?.id;
                auditLog.payload = this.sanitizePayload(body);
                auditLog.ipAddress = ip;
                auditLog.userAgent = userAgent;
                await this.auditLogRepository.save(auditLog);
                this.logger.log(`Audit: ${method} ${url} by user ${user?.userId || user?.id || "anonymous"} - ResourceID: ${auditLog.resourceId}`);
            }
            catch (error) {
                this.logger.error("Failed to save audit log", error);
            }
        }));
    }
    sanitizePayload(payload) {
        if (!payload)
            return payload;
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
};
exports.AuditInterceptor = AuditInterceptor;
exports.AuditInterceptor = AuditInterceptor = AuditInterceptor_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_2.InjectRepository)(audit_log_entity_1.AuditLog)),
    __metadata("design:paramtypes", [typeorm_1.Repository])
], AuditInterceptor);
//# sourceMappingURL=audit.interceptor.js.map