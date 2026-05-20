"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const throttler_1 = require("@nestjs/throttler");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const medical_module_1 = require("./medical/medical.module");
const vaccination_module_1 = require("./vaccination/vaccination.module");
const ussd_module_1 = require("./ussd/ussd.module");
const telecom_module_1 = require("./telecom/telecom.module");
const pharmacy_module_1 = require("./pharmacy/pharmacy.module");
const app_config_module_1 = require("./config/app-config.module");
const app_config_service_1 = require("./config/app-config.service");
const health_module_1 = require("./health/health.module");
const audit_module_1 = require("./common/audit/audit.module");
const audit_interceptor_1 = require("./common/audit/audit.interceptor");
const monitoring_module_1 = require("./monitoring/monitoring.module");
const laboratory_module_1 = require("./laboratory/laboratory.module");
const consent_module_1 = require("./consent/consent.module");
const stats_module_1 = require("./stats/stats.module");
const notifications_module_1 = require("./notifications/notifications.module");
const ai_module_1 = require("./ai/ai.module");
const messages_module_1 = require("./messages/messages.module");
const appointment_module_1 = require("./appointment/appointment.module");
const core_1 = require("@nestjs/core");
const env_validation_1 = require("./config/env.validation");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: [".env.local", ".env"],
                validate: env_validation_1.validate,
            }),
            app_config_module_1.AppConfigModule,
            throttler_1.ThrottlerModule.forRootAsync({
                imports: [app_config_module_1.AppConfigModule],
                useFactory: (config) => [
                    {
                        ttl: config.rateLimitTtl,
                        limit: config.rateLimitMax,
                    },
                ],
                inject: [app_config_service_1.AppConfigService],
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [app_config_module_1.AppConfigModule],
                useFactory: (config) => ({
                    type: config.dbType,
                    host: config.dbHost,
                    port: config.dbPort,
                    username: config.dbUsername,
                    password: config.dbPassword,
                    database: config.dbDatabase,
                    ssl: config.dbType === "postgres" && config.dbSsl
                        ? { rejectUnauthorized: false }
                        : false,
                    autoLoadEntities: true,
                    synchronize: config.isDevelopment && process.env.USE_SYNC === "true",
                    logging: config.isDevelopment,
                    extra: config.dbType === "sqlite"
                        ? {
                            busyTimeout: 30000,
                            synchronous: "NORMAL",
                            journal_mode: "WAL",
                        }
                        : undefined,
                }),
                inject: [app_config_service_1.AppConfigService],
            }),
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            medical_module_1.MedicalModule,
            vaccination_module_1.VaccinationModule,
            ussd_module_1.UssdModule,
            telecom_module_1.TelecomModule,
            pharmacy_module_1.PharmacyModule,
            health_module_1.HealthModule,
            audit_module_1.AuditModule,
            monitoring_module_1.MonitoringModule,
            laboratory_module_1.LaboratoryModule,
            consent_module_1.ConsentModule,
            stats_module_1.StatsModule,
            notifications_module_1.NotificationsModule,
            ai_module_1.AiModule,
            messages_module_1.MessagesModule,
            appointment_module_1.AppointmentModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            app_service_1.AppService,
            { provide: core_1.APP_GUARD, useClass: throttler_1.ThrottlerGuard },
            { provide: core_1.APP_INTERCEPTOR, useClass: audit_interceptor_1.AuditInterceptor },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map