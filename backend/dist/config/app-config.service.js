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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppConfigService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let AppConfigService = class AppConfigService {
    constructor(configService) {
        this.configService = configService;
    }
    get nodeEnv() {
        return this.configService.get("NODE_ENV") || "development";
    }
    get isProduction() {
        return this.nodeEnv === "production";
    }
    get isDevelopment() {
        return this.nodeEnv === "development";
    }
    get port() {
        return parseInt(this.configService.get("PORT") || "3001", 10);
    }
    get host() {
        return this.configService.get("HOST") || "0.0.0.0";
    }
    get dbType() {
        return this.configService.get("DB_TYPE") || "postgres";
    }
    get dbHost() {
        const value = this.configService.get("DB_HOST");
        if (!value && this.dbType === "postgres")
            throw new Error("DB_HOST is required for postgres");
        return value || "localhost";
    }
    get dbPort() {
        const value = this.configService.get("DB_PORT");
        if (!value && this.dbType === "postgres")
            throw new Error("DB_PORT is required for postgres");
        return parseInt(value || "5432", 10);
    }
    get dbUsername() {
        const value = this.configService.get("DB_USERNAME");
        if (!value && this.dbType === "postgres")
            throw new Error("DB_USERNAME is required for postgres");
        return value || "";
    }
    get dbPassword() {
        const password = this.configService.get("DB_PASSWORD");
        if (!password && this.dbType === "postgres") {
            throw new Error("DB_PASSWORD is required for postgres");
        }
        return password || "";
    }
    get dbDatabase() {
        const value = this.configService.get("DB_DATABASE");
        if (!value && this.dbType === "postgres")
            throw new Error("DB_DATABASE is required");
        return value || "database.sqlite";
    }
    get dbSsl() {
        return this.configService.get("DB_SSL") === "true";
    }
    get jwtSecret() {
        const secret = this.configService.get("JWT_SECRET");
        if (!secret || secret.length < 32) {
            throw new Error("JWT_SECRET must be at least 32 characters");
        }
        return secret;
    }
    get jwtRefreshSecret() {
        const secret = this.configService.get("JWT_REFRESH_SECRET");
        if (!secret || secret.length < 32) {
            throw new Error("JWT_REFRESH_SECRET must be at least 32 characters");
        }
        return secret;
    }
    get jwtAccessExpiration() {
        return this.configService.get("JWT_ACCESS_EXPIRATION") || 900;
    }
    get jwtRefreshExpiration() {
        return this.configService.get("JWT_REFRESH_EXPIRATION") || 604800;
    }
    get rateLimitTtl() {
        return parseInt(this.configService.get("RATE_LIMIT_TTL") || "60000", 10);
    }
    get rateLimitMax() {
        return parseInt(this.configService.get("RATE_LIMIT_MAX") || "20", 10);
    }
    get atUsername() {
        return this.configService.get("AT_USERNAME") || "";
    }
    get atApiKey() {
        return this.configService.get("AT_API_KEY") || "";
    }
    get atSmsFrom() {
        return this.configService.get("AT_SMS_FROM") || "FasoCare";
    }
    get corsOrigins() {
        const origins = this.configService.get("CORS_ORIGINS");
        if (origins) {
            return origins.split(",").map((o) => o.trim());
        }
        return ["http://localhost:3000", "http://localhost:8081"];
    }
    get enableAutoVerification() {
        return (this.configService.get("ENABLE_AUTO_VERIFICATION") === "true");
    }
    get enableSmsNotifications() {
        return (this.configService.get("ENABLE_SMS_NOTIFICATIONS") !== "false");
    }
    get enableSwagger() {
        const flag = this.configService.get("ENABLE_SWAGGER");
        if (flag !== undefined) {
            return flag === "true";
        }
        return this.isDevelopment;
    }
    get redisHost() {
        return this.configService.get("REDIS_HOST") || "localhost";
    }
    get redisPort() {
        return parseInt(this.configService.get("REDIS_PORT") || "6379", 10);
    }
    get encryptionKey() {
        const key = this.configService.get("ENCRYPTION_KEY");
        if (!key) {
            throw new Error("ENCRYPTION_KEY is required");
        }
        return key;
    }
    get ollamaEndpoint() {
        return this.configService.get("OLLAMA_ENDPOINT") || "";
    }
    get ollamaModel() {
        return this.configService.get("OLLAMA_MODEL") || "llama3";
    }
    get enableOfflineAI() {
        return this.configService.get("ENABLE_OFFLINE_AI") !== "false";
    }
};
exports.AppConfigService = AppConfigService;
exports.AppConfigService = AppConfigService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], AppConfigService);
//# sourceMappingURL=app-config.service.js.map