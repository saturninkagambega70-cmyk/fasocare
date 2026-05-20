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
exports.AppointmentService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const appointment_entity_1 = require("./entities/appointment.entity");
let AppointmentService = class AppointmentService {
    constructor(appointmentRepository) {
        this.appointmentRepository = appointmentRepository;
    }
    async create(data) {
        const appointment = this.appointmentRepository.create(data);
        return this.appointmentRepository.save(appointment);
    }
    async findByPatient(patientId) {
        return this.appointmentRepository.find({
            where: { patient: { id: patientId } },
            relations: ["doctor"],
            order: { date: "DESC" },
        });
    }
    async findByDoctor(doctorId) {
        return this.appointmentRepository.find({
            where: { doctor: { id: doctorId } },
            relations: ["patient"],
            order: { date: "DESC" },
        });
    }
    async findOne(id) {
        const appointment = await this.appointmentRepository.findOne({
            where: { id },
            relations: ["patient", "doctor"],
        });
        if (!appointment)
            throw new common_1.NotFoundException("Rendez-vous non trouvé");
        return appointment;
    }
    async confirm(id, doctorId) {
        const appointment = await this.findOne(id);
        if (appointment.doctor?.id !== doctorId) {
            throw new common_1.ForbiddenException("Vous ne pouvez pas confirmer ce rendez-vous");
        }
        appointment.status = appointment_entity_1.AppointmentStatus.CONFIRMED;
        return this.appointmentRepository.save(appointment);
    }
    async complete(id, doctorId) {
        const appointment = await this.findOne(id);
        if (appointment.doctor?.id !== doctorId) {
            throw new common_1.ForbiddenException("Vous ne pouvez pas compléter ce rendez-vous");
        }
        appointment.status = appointment_entity_1.AppointmentStatus.COMPLETED;
        appointment.completedAt = new Date();
        return this.appointmentRepository.save(appointment);
    }
    async cancel(id, userId) {
        const appointment = await this.findOne(id);
        if (appointment.patient?.id !== userId &&
            appointment.doctor?.id !== userId) {
            throw new common_1.ForbiddenException("Vous ne pouvez pas annuler ce rendez-vous");
        }
        appointment.status = appointment_entity_1.AppointmentStatus.CANCELLED;
        appointment.cancelledAt = new Date();
        return this.appointmentRepository.save(appointment);
    }
};
exports.AppointmentService = AppointmentService;
exports.AppointmentService = AppointmentService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(appointment_entity_1.Appointment)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], AppointmentService);
//# sourceMappingURL=appointment.service.js.map