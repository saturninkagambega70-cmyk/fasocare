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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthController = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const swagger_1 = require("@nestjs/swagger");
const ioredis_1 = __importDefault(require("ioredis"));
let HealthController = class HealthController {
    constructor(connection, redis) {
        this.connection = connection;
        this.redis = redis;
    }
    async check() {
        return {
            status: "ok",
            timestamp: new Date().toISOString(),
            service: "FasoCare Core API",
            version: process.env.npm_package_version || "1.0.0",
        };
    }
    async checkDb() {
        try {
            await this.connection.query("SELECT 1");
            return {
                status: "ok",
                database: "connected",
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            return {
                status: "error",
                database: "disconnected",
                error: error.message,
                timestamp: new Date().toISOString(),
            };
        }
    }
    async checkRedis() {
        if (!this.redis) {
            return {
                status: "error",
                redis: "not_configured",
                timestamp: new Date().toISOString(),
            };
        }
        try {
            await this.redis.ping();
            return {
                status: "ok",
                redis: "connected",
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            return {
                status: "error",
                redis: "disconnected",
                error: error.message,
                timestamp: new Date().toISOString(),
            };
        }
    }
    async ready() {
        const dbHealthy = await this.checkDb().then((r) => r.status === "ok");
        const redisHealthy = await this.checkRedis().then((r) => r.status === "ok");
        if (dbHealthy && redisHealthy) {
            return {
                status: "ready",
                timestamp: new Date().toISOString(),
            };
        }
        return {
            status: "not ready",
            db: dbHealthy ? "ok" : "error",
            redis: redisHealthy ? "ok" : "error",
            timestamp: new Date().toISOString(),
        };
    }
};
exports.HealthController = HealthController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: "Basic health check" }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "check", null);
__decorate([
    (0, common_1.Get)("db"),
    (0, swagger_1.ApiOperation)({ summary: "Database health check" }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "checkDb", null);
__decorate([
    (0, common_1.Get)("redis"),
    (0, swagger_1.ApiOperation)({ summary: "Redis health check" }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "checkRedis", null);
__decorate([
    (0, common_1.Get)("ready"),
    (0, swagger_1.ApiOperation)({ summary: "Kubernetes readiness probe" }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "ready", null);
exports.HealthController = HealthController = __decorate([
    (0, swagger_1.ApiTags)("Health"),
    (0, common_1.Controller)("health"),
    __param(0, (0, typeorm_1.InjectConnection)()),
    __param(1, (0, common_1.Inject)("REDIS_CLIENT")),
    __param(1, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [typeorm_2.Connection,
        ioredis_1.default])
], HealthController);
//# sourceMappingURL=health.controller.js.map