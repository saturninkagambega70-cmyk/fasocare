import { Module } from "@nestjs/common";
import { UssdService } from "./ussd.service";
import { UssdController } from "./ussd.controller";
import { VaccinationModule } from "../vaccination/vaccination.module";
import { MedicalModule } from "../medical/medical.module";
import { UsersModule } from "../users/users.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "../users/entities/user.entity";
import { AppConfigModule } from "../config/app-config.module";
import { AppConfigService } from "../config/app-config.service";
import { TelecomModule } from "../telecom/telecom.module";

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
  imports: [
    VaccinationModule,
    MedicalModule,
    UsersModule,
    TypeOrmModule.forFeature([User]),
    AppConfigModule,
    TelecomModule,
  ],
  controllers: [UssdController],
  providers: [UssdService, RedisProvider],
  exports: [UssdService],
})
export class UssdModule {}
