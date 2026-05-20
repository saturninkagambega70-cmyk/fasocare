import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AppConfigService {
  constructor(private configService: ConfigService) {}

  get nodeEnv(): string {
    return this.configService.get<string>("NODE_ENV") || "development";
  }

  get isProduction(): boolean {
    return this.nodeEnv === "production";
  }

  get isDevelopment(): boolean {
    return this.nodeEnv === "development";
  }

  get port(): number {
    return parseInt(this.configService.get<string>("PORT") || "3001", 10);
  }

  get host(): string {
    return this.configService.get<string>("HOST") || "0.0.0.0";
  }

  // Database
  get dbType(): "postgres" | "sqlite" {
    return (this.configService.get<string>("DB_TYPE") as any) || "postgres";
  }

  get dbHost(): string {
    const value = this.configService.get<string>("DB_HOST");
    if (!value && this.dbType === "postgres")
      throw new Error("DB_HOST is required for postgres");
    return value || "localhost";
  }

  get dbPort(): number {
    const value = this.configService.get<string>("DB_PORT");
    if (!value && this.dbType === "postgres")
      throw new Error("DB_PORT is required for postgres");
    return parseInt(value || "5432", 10);
  }

  get dbUsername(): string {
    const value = this.configService.get<string>("DB_USERNAME");
    if (!value && this.dbType === "postgres")
      throw new Error("DB_USERNAME is required for postgres");
    return value || "";
  }

  get dbPassword(): string {
    const password = this.configService.get<string>("DB_PASSWORD");
    if (!password && this.dbType === "postgres") {
      throw new Error("DB_PASSWORD is required for postgres");
    }
    return password || "";
  }

  get dbDatabase(): string {
    const value = this.configService.get<string>("DB_DATABASE");
    if (!value && this.dbType === "postgres")
      throw new Error("DB_DATABASE is required");
    return value || "database.sqlite";
  }

  get dbSsl(): boolean {
    return this.configService.get<string>("DB_SSL") === "true";
  }

  // JWT
  get jwtSecret(): string {
    const secret = this.configService.get<string>("JWT_SECRET");
    if (!secret || secret.length < 32) {
      throw new Error("JWT_SECRET must be at least 32 characters");
    }
    return secret;
  }

  get jwtRefreshSecret(): string {
    const secret = this.configService.get<string>("JWT_REFRESH_SECRET");
    if (!secret || secret.length < 32) {
      throw new Error("JWT_REFRESH_SECRET must be at least 32 characters");
    }
    return secret;
  }

  get jwtAccessExpiration(): number {
    return this.configService.get<number>("JWT_ACCESS_EXPIRATION") || 900;
  }

  get jwtRefreshExpiration(): number {
    return this.configService.get<number>("JWT_REFRESH_EXPIRATION") || 604800;
  }

  // Rate Limiting
  get rateLimitTtl(): number {
    return parseInt(
      this.configService.get<string>("RATE_LIMIT_TTL") || "60000",
      10,
    );
  }

  get rateLimitMax(): number {
    return parseInt(
      this.configService.get<string>("RATE_LIMIT_MAX") || "20",
      10,
    );
  }

  // Africa's Talking
  get atUsername(): string {
    return this.configService.get<string>("AT_USERNAME") || "";
  }

  get atApiKey(): string {
    return this.configService.get<string>("AT_API_KEY") || "";
  }

  get atSmsFrom(): string {
    return this.configService.get<string>("AT_SMS_FROM") || "FasoCare";
  }

  // CORS
  get corsOrigins(): string[] {
    const origins = this.configService.get<string>("CORS_ORIGINS");
    if (origins) {
      return origins.split(",").map((o) => o.trim());
    }
    return ["http://localhost:3000", "http://localhost:8081"];
  }

  // Feature Flags
  get enableAutoVerification(): boolean {
    return (
      this.configService.get<string>("ENABLE_AUTO_VERIFICATION") === "true"
    );
  }

  get enableSmsNotifications(): boolean {
    return (
      this.configService.get<string>("ENABLE_SMS_NOTIFICATIONS") !== "false"
    );
  }

  get enableSwagger(): boolean {
    const flag = this.configService.get<string>("ENABLE_SWAGGER");
    if (flag !== undefined) {
      return flag === "true";
    }
    return this.isDevelopment;
  }

  // Redis
  get redisHost(): string {
    return this.configService.get<string>("REDIS_HOST") || "localhost";
  }

  get redisPort(): number {
    return parseInt(this.configService.get<string>("REDIS_PORT") || "6379", 10);
  }

  get encryptionKey(): string {
    const key = this.configService.get<string>("ENCRYPTION_KEY");
    if (!key) {
      throw new Error("ENCRYPTION_KEY is required");
    }
    return key;
  }

  get ollamaEndpoint(): string {
    return this.configService.get<string>("OLLAMA_ENDPOINT") || "";
  }

  get ollamaModel(): string {
    return this.configService.get<string>("OLLAMA_MODEL") || "llama3";
  }

  get enableOfflineAI(): boolean {
    return this.configService.get<string>("ENABLE_OFFLINE_AI") !== "false";
  }
}
