import { Controller, Get, Inject, Optional } from "@nestjs/common";
import { InjectConnection } from "@nestjs/typeorm";
import { Connection } from "typeorm";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import Redis from "ioredis";

@ApiTags("Health")
@Controller("health")
export class HealthController {
  constructor(
    @InjectConnection() private connection: Connection,
    @Inject("REDIS_CLIENT") @Optional() private readonly redis: Redis | null,
  ) {}

  @Get()
  @ApiOperation({ summary: "Basic health check" })
  async check() {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      service: "FasoCare Core API",
      version: process.env.npm_package_version || "1.0.0",
    };
  }

  @Get("db")
  @ApiOperation({ summary: "Database health check" })
  async checkDb() {
    try {
      await this.connection.query("SELECT 1");
      return {
        status: "ok",
        database: "connected",
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: "error",
        database: "disconnected",
        error: (error as any).message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Get("redis")
  @ApiOperation({ summary: "Redis health check" })
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
    } catch (error) {
      return {
        status: "error",
        redis: "disconnected",
        error: (error as any).message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Get("ready")
  @ApiOperation({ summary: "Kubernetes readiness probe" })
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
}
