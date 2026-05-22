import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { MedicalModule } from "./medical/medical.module";
import { VaccinationModule } from "./vaccination/vaccination.module";
import { UssdModule } from "./ussd/ussd.module";
import { TelecomModule } from "./telecom/telecom.module";
import { PharmacyModule } from "./pharmacy/pharmacy.module";
import { AppConfigModule } from "./config/app-config.module";
import { AppConfigService } from "./config/app-config.service";
import { HealthModule } from "./health/health.module";
import { AuditModule } from "./common/audit/audit.module";
import { AuditInterceptor } from "./common/audit/audit.interceptor";
import { MonitoringModule } from "./monitoring/monitoring.module";
import { BullModule } from "@nestjs/bullmq";
import { LaboratoryModule } from "./laboratory/laboratory.module";
import { ConsentModule } from "./consent/consent.module";
import { StatsModule } from "./stats/stats.module";
import { NotificationsModule } from "./notifications/notifications.module";
import { AiModule } from "./ai/ai.module";
import { MessagesModule } from "./messages/messages.module";
import { AppointmentModule } from "./appointment/appointment.module";
import { APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
import { validate } from "./config/env.validation";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env.local", ".env"],
      validate,
    }),
    AppConfigModule,
    // Rate limiting from environment config
    ThrottlerModule.forRootAsync({
      imports: [AppConfigModule],
      useFactory: (config: AppConfigService) => [
        {
          ttl: config.rateLimitTtl,
          limit: config.rateLimitMax,
        },
      ],
      inject: [AppConfigService],
    }),
    TypeOrmModule.forRootAsync({
      imports: [AppConfigModule],
      useFactory: (config: AppConfigService) =>
        ({
          type: config.dbType,
          host: config.dbHost,
          port: config.dbPort,
          username: config.dbUsername,
          password: config.dbPassword,
          database: config.dbDatabase,
          ssl:
            config.dbType === "postgres" && config.dbSsl
              ? { rejectUnauthorized: false }
              : false,
          autoLoadEntities: true,
          synchronize: process.env.USE_SYNC === "true",
          logging: config.isDevelopment,
          extra:
            config.dbType === "sqlite"
              ? {
                  busyTimeout: 30000,
                  synchronous: "NORMAL",
                  journal_mode: "WAL",
                }
              : undefined,
        }) as any,
      inject: [AppConfigService],
    }),
    AuthModule,
    UsersModule,
    MedicalModule,
    VaccinationModule,
    UssdModule,
    TelecomModule,
    PharmacyModule,
    HealthModule,
    AuditModule,
    MonitoringModule,
    // BullModule.forRootAsync({
    //   imports: [AppConfigModule],
    //   useFactory: (config: AppConfigService) => ({
    //     connection: {
    //       host: config.redisHost,
    //       port: config.redisPort,
    //     },
    //   }),
    //   inject: [AppConfigService],
    // }),
    LaboratoryModule,
    ConsentModule,
    StatsModule,
    NotificationsModule,
    AiModule,
    MessagesModule,
    AppointmentModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Apply rate limiting globally
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    // Apply audit trail globally
    { provide: APP_INTERCEPTOR, useClass: AuditInterceptor },
  ],
})
export class AppModule {}
