import { Module } from "@nestjs/common";
import { HealthController } from "./health.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppConfigModule } from "../config/app-config.module";
import { AppConfigService } from "../config/app-config.service";

const RedisProvider = {
  provide: "REDIS_CLIENT",
  useFactory: (config: AppConfigService) => {
    try {
      const Redis = require("ioredis");
      const client = new Redis({
        host: config.redisHost,
        port: config.redisPort,
        lazyConnect: true,
        maxRetriesPerRequest: 0,
        retryStrategy: () => null,
      });
      client.connect().catch(() => {});
      client.on("error", () => {});
      return client;
    } catch {
      return null;
    }
  },
  inject: [AppConfigService],
};

@Module({
  imports: [TypeOrmModule.forFeature([]), AppConfigModule],
  controllers: [HealthController],
  providers: [RedisProvider],
})
export class HealthModule {}
