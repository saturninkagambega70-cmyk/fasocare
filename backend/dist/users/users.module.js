"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const users_service_1 = require("./users.service");
const user_entity_1 = require("./entities/user.entity");
const seed_service_1 = require("./seed.service");
const consultation_entity_1 = require("../medical/entities/consultation.entity");
const vaccination_record_entity_1 = require("../vaccination/entities/vaccination-record.entity");
const pharmacy_entity_1 = require("../pharmacy/entities/pharmacy.entity");
const app_config_module_1 = require("../config/app-config.module");
const medical_module_1 = require("../medical/medical.module");
const users_controller_1 = require("./users.controller");
let UsersModule = class UsersModule {
};
exports.UsersModule = UsersModule;
exports.UsersModule = UsersModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([user_entity_1.User, consultation_entity_1.Consultation, vaccination_record_entity_1.VaccinationRecord, pharmacy_entity_1.Pharmacy]),
            app_config_module_1.AppConfigModule,
            (0, common_1.forwardRef)(() => medical_module_1.MedicalModule),
        ],
        controllers: [users_controller_1.UsersController],
        providers: [users_service_1.UsersService, seed_service_1.SeedService],
        exports: [users_service_1.UsersService],
    })
], UsersModule);
//# sourceMappingURL=users.module.js.map