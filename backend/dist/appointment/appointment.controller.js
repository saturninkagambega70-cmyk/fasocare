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
exports.AppointmentController = void 0;
const common_1 = require("@nestjs/common");
const appointment_service_1 = require("./appointment.service");
const create_appointment_dto_1 = require("./dto/create-appointment.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const user_entity_1 = require("../users/entities/user.entity");
let AppointmentController = class AppointmentController {
    constructor(appointmentService) {
        this.appointmentService = appointmentService;
    }
    async create(body, req) {
        const appointment = await this.appointmentService.create({
            patient: { id: req.user.userId },
            doctor: { id: body.doctorId },
            date: body.date,
            time: body.time,
            reason: body.reason,
            facility: body.facility,
        });
        return { statusCode: 201, success: true, data: appointment };
    }
    async getMyAppointments(req) {
        const appointments = await this.appointmentService.findByPatient(req.user.userId);
        return { statusCode: 200, success: true, data: appointments };
    }
    async getDoctorAppointments(req) {
        const appointments = await this.appointmentService.findByDoctor(req.user.userId);
        return { statusCode: 200, success: true, data: appointments };
    }
    async confirm(id, req) {
        const appointment = await this.appointmentService.confirm(id, req.user.userId);
        return { statusCode: 200, success: true, data: appointment };
    }
    async complete(id, req) {
        const appointment = await this.appointmentService.complete(id, req.user.userId);
        return { statusCode: 200, success: true, data: appointment };
    }
    async cancel(id, req) {
        const appointment = await this.appointmentService.cancel(id, req.user.userId);
        return { statusCode: 200, success: true, data: appointment };
    }
};
exports.AppointmentController = AppointmentController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.PATIENT, user_entity_1.UserRole.PARENT, user_entity_1.UserRole.DOCTOR),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_appointment_dto_1.CreateAppointmentDto, Object]),
    __metadata("design:returntype", Promise)
], AppointmentController.prototype, "create", null);
__decorate([
    (0, common_1.Get)("my-appointments"),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.PATIENT, user_entity_1.UserRole.PARENT),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppointmentController.prototype, "getMyAppointments", null);
__decorate([
    (0, common_1.Get)("doctor-appointments"),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppointmentController.prototype, "getDoctorAppointments", null);
__decorate([
    (0, common_1.Patch)(":id/confirm"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AppointmentController.prototype, "confirm", null);
__decorate([
    (0, common_1.Patch)(":id/complete"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AppointmentController.prototype, "complete", null);
__decorate([
    (0, common_1.Patch)(":id/cancel"),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.PATIENT, user_entity_1.UserRole.DOCTOR, user_entity_1.UserRole.PARENT),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AppointmentController.prototype, "cancel", null);
exports.AppointmentController = AppointmentController = __decorate([
    (0, common_1.Controller)("appointments"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [appointment_service_1.AppointmentService])
], AppointmentController);
//# sourceMappingURL=appointment.controller.js.map