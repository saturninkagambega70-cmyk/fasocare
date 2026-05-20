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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VaccinationController = void 0;
const common_1 = require("@nestjs/common");
const vaccination_service_1 = require("./vaccination.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const user_entity_1 = require("../users/entities/user.entity");
const users_service_1 = require("../users/users.service");
let VaccinationController = class VaccinationController {
    constructor(vaccinationService, usersService) {
        this.vaccinationService = vaccinationService;
        this.usersService = usersService;
    }
    async getRecords(id, req) {
        if (req.user.role === user_entity_1.UserRole.PATIENT && req.user.userId !== id) {
            throw new common_1.ForbiddenException("Accès interdit à ce carnet vaccinal");
        }
        if (req.user.role === user_entity_1.UserRole.PARENT) {
            const isOwnedChild = await this.usersService.isChildOfParent(req.user.userId, id);
            if (!isOwnedChild) {
                throw new common_1.ForbiddenException("Cet enfant n'est pas lié à votre compte parent");
            }
        }
        return this.vaccinationService.findByPatient(id);
    }
    async addRecord(body) {
        return this.vaccinationService.create(body);
    }
    async getSchedule(patientId) {
        return this.vaccinationService.getSchedule(patientId);
    }
    async getUpcomingReminders() {
        return this.vaccinationService.findUpcomingReminders(48);
    }
};
exports.VaccinationController = VaccinationController;
__decorate([
    (0, common_1.Get)("child/:id"),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.PARENT, user_entity_1.UserRole.PATIENT, user_entity_1.UserRole.DOCTOR, user_entity_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], VaccinationController.prototype, "getRecords", null);
__decorate([
    (0, common_1.Post)("record"),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.DOCTOR, user_entity_1.UserRole.ADMIN),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], VaccinationController.prototype, "addRecord", null);
__decorate([
    (0, common_1.Get)("schedule/:patientId"),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.PATIENT, user_entity_1.UserRole.PARENT, user_entity_1.UserRole.DOCTOR, user_entity_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)("patientId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VaccinationController.prototype, "getSchedule", null);
__decorate([
    (0, common_1.Get)("reminders"),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.DOCTOR),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], VaccinationController.prototype, "getUpcomingReminders", null);
exports.VaccinationController = VaccinationController = __decorate([
    (0, common_1.Controller)("vaccination"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [vaccination_service_1.VaccinationService,
        users_service_1.UsersService])
], VaccinationController);
//# sourceMappingURL=vaccination.controller.js.map