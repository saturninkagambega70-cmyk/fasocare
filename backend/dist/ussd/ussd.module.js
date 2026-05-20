"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UssdModule = void 0;
const common_1 = require("@nestjs/common");
const ussd_service_1 = require("./ussd.service");
const ussd_controller_1 = require("./ussd.controller");
const vaccination_module_1 = require("../vaccination/vaccination.module");
const medical_module_1 = require("../medical/medical.module");
const users_module_1 = require("../users/users.module");
const typeorm_1 = require("@nestjs/typeorm");
const user_entity_1 = require("../users/entities/user.entity");
const app_config_module_1 = require("../config/app-config.module");
const app_config_service_1 = require("../config/app-config.service");
const telecom_module_1 = require("../telecom/telecom.module");
const RedisProvider = {
    provide: "REDIS_CLIENT",
    useFactory: (config) => {
        try {
            const Redis = require("ioredis");
            const client = new Redis({
                host: config.redisHost,
                port: config.redisPort,
                lazyConnect: true,
                maxRetriesPerRequest: 0,
                retryStrategy: () => null,
            });
            client.connect().catch(() => { });
            client.on("error", () => { });
            return client;
        }
        catch {
            return null;
        }
    },
    inject: [app_config_service_1.AppConfigService],
};
let UssdModule = class UssdModule {
};
exports.UssdModule = UssdModule;
exports.UssdModule = UssdModule = __decorate([
    (0, common_1.Module)({
        imports: [
            vaccination_module_1.VaccinationModule,
            medical_module_1.MedicalModule,
            users_module_1.UsersModule,
            typeorm_1.TypeOrmModule.forFeature([user_entity_1.User]),
            app_config_module_1.AppConfigModule,
            telecom_module_1.TelecomModule,
        ],
        controllers: [ussd_controller_1.UssdController],
        providers: [ussd_service_1.UssdService, RedisProvider],
        exports: [ussd_service_1.UssdService],
    })
], UssdModule);
//# sourceMappingURL=ussd.module.js.map