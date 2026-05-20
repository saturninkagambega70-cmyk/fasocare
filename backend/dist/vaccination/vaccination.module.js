"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VaccinationModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const vaccination_service_1 = require("./vaccination.service");
const vaccination_controller_1 = require("./vaccination.controller");
const vaccination_record_entity_1 = require("./entities/vaccination-record.entity");
const users_module_1 = require("../users/users.module");
let VaccinationModule = class VaccinationModule {
};
exports.VaccinationModule = VaccinationModule;
exports.VaccinationModule = VaccinationModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([vaccination_record_entity_1.VaccinationRecord]), users_module_1.UsersModule],
        providers: [vaccination_service_1.VaccinationService],
        controllers: [vaccination_controller_1.VaccinationController],
        exports: [vaccination_service_1.VaccinationService],
    })
], VaccinationModule);
//# sourceMappingURL=vaccination.module.js.map