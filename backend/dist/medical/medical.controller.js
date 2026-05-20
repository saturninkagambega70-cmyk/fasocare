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
exports.MedicalController = void 0;
const common_1 = require("@nestjs/common");
const medical_service_1 = require("./medical.service");
const triage_service_1 = require("./triage.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const public_decorator_1 = require("../auth/public.decorator");
const user_entity_1 = require("../users/entities/user.entity");
const users_service_1 = require("../users/users.service");
let MedicalController = class MedicalController {
    constructor(medicalService, triageService, usersService) {
        this.medicalService = medicalService;
        this.triageService = triageService;
        this.usersService = usersService;
    }
    async listConsultations(patientId, doctorId, limit = 100, req) {
        let consultations = [];
        if (patientId) {
            consultations = await this.medicalService.findAllByPatient(patientId);
        }
        else if (doctorId) {
            consultations = await this.medicalService.findAllByDoctor(doctorId);
        }
        else {
            consultations = await this.medicalService.getQueue();
        }
        return {
            statusCode: 200,
            success: true,
            data: {
                consultations: consultations.slice(0, limit),
                total: consultations.length,
            },
        };
    }
    async getConsultation(id) {
        try {
            const consultation = await this.medicalService.findOne(id);
            return {
                statusCode: 200,
                success: true,
                data: consultation,
            };
        }
        catch (error) {
            return {
                statusCode: 404,
                success: false,
                message: error.message || "Consultation not found",
            };
        }
    }
    async createConsultationAPI(body, req) {
        try {
            const consultation = await this.medicalService.create({
                ...body,
                doctor: { id: req.user.userId },
            });
            return {
                statusCode: 201,
                success: true,
                data: consultation,
            };
        }
        catch (error) {
            return {
                statusCode: 400,
                success: false,
                message: error.message,
            };
        }
    }
    async getPatientHistory(patientId, req) {
        try {
            if (req.user.activeRole === user_entity_1.UserRole.PARENT ||
                req.user.roles?.includes(user_entity_1.UserRole.PARENT)) {
                const isChild = await this.usersService.isChildOfParent(req.user.userId, patientId);
                if (!isChild)
                    throw new common_1.ForbiddenException("Vous ne pouvez consulter que les dossiers de vos enfants.");
            }
            const consultations = await this.medicalService.findAllByPatient(patientId);
            const enriched = await Promise.all(consultations.map(async (c) => ({
                ...c,
                items: await this.medicalService.getItemsForConsultation(c.id),
            })));
            return {
                statusCode: 200,
                success: true,
                data: enriched,
            };
        }
        catch (error) {
            return {
                statusCode: error instanceof common_1.ForbiddenException ? 403 : 400,
                success: false,
                message: error.message,
            };
        }
    }
    async getHistory(req) {
        if (req.user.role === user_entity_1.UserRole.DOCTOR) {
            return this.medicalService.findAllByDoctor(req.user.userId);
        }
        const consultations = await this.medicalService.findAllByPatient(req.user.userId);
        const enriched = await Promise.all(consultations.map(async (c) => ({
            ...c,
            items: await this.medicalService.getItemsForConsultation(c.id),
        })));
        return {
            statusCode: 200,
            success: true,
            data: enriched,
        };
    }
    async getMyConsultations(req) {
        try {
            const consultations = await this.medicalService.findAllByPatient(req.user.userId);
            return {
                statusCode: 200,
                success: true,
                data: consultations,
            };
        }
        catch (error) {
            return {
                statusCode: 400,
                success: false,
                message: error.message,
            };
        }
    }
    async createConsultation(body, req) {
        const { patientId, ...rest } = body;
        return this.medicalService.create({
            ...rest,
            patient: patientId ? { id: patientId } : undefined,
            doctor: { id: req.user.userId },
        });
    }
    async getQueue() {
        return this.medicalService.getQueue();
    }
    async getLatestPatients() {
        return this.medicalService.getQueue();
    }
    async validatePrescription(token) {
        return this.medicalService.validatePrescription(token);
    }
    async dispense(token, body = {}, req) {
        return this.medicalService.dispense(token, req.user.userId, body?.pharmacyId);
    }
    async addPrescriptionItems(id, items) {
        return this.medicalService.addPrescriptionItems(id, items);
    }
    async getPrescriptionItems(id) {
        return this.medicalService.getItemsForConsultation(id);
    }
    async getItemsWithAvailability(token, pharmacyId) {
        return this.medicalService.getItemsWithAvailability(token, pharmacyId);
    }
    async dispenseItems(token, body, req) {
        return this.medicalService.dispenseItems(token, req.user.userId, body?.pharmacyId, body.items);
    }
    async reportEpidemic(body, req) {
        return this.medicalService.reportEpidemic(req.user, body);
    }
    async getEpidemicReports(req) {
        const doctorId = req.user.role === user_entity_1.UserRole.DOCTOR ? req.user.userId : undefined;
        return this.medicalService.getEpidemicReports(doctorId);
    }
    async sendMessage(body, req) {
        return this.medicalService.sendMessage(req.user, body.receiverId, body.content);
    }
    async getMessages(req) {
        return this.medicalService.getMessages(req.user.userId);
    }
    async getNotifications(req) {
        return this.medicalService.getNotifications(req.user.userId);
    }
    async markAsRead(id, req) {
        return this.medicalService.markNotificationAsRead(id, req.user.userId);
    }
    async sendEmergency(body, req) {
        try {
            const emergency = await this.medicalService.sendEmergency(req.user, body);
            return {
                statusCode: 201,
                success: true,
                message: "Appel d'urgence envoyé. Une équipe d'intervention est en route.",
                data: emergency,
            };
        }
        catch (error) {
            return {
                statusCode: 400,
                success: false,
                message: error.message,
            };
        }
    }
    async sendEmergencyCompat(body, req) {
        try {
            const emergency = await this.medicalService.sendEmergency(req.user, body);
            return {
                statusCode: 201,
                success: true,
                message: "Appel d'urgence envoyé.",
                data: emergency,
            };
        }
        catch (error) {
            return {
                statusCode: 400,
                success: false,
                message: error.message,
            };
        }
    }
    async getEmergenciesCompat(req) {
        try {
            const emergencies = await this.medicalService.getEmergencies(req.user.userId);
            return {
                statusCode: 200,
                success: true,
                data: emergencies,
            };
        }
        catch (error) {
            return {
                statusCode: 400,
                success: false,
                message: error.message,
            };
        }
    }
    async getEmergencies(req) {
        try {
            const emergencies = await this.medicalService.getEmergencies(req.user.userId);
            return {
                statusCode: 200,
                success: true,
                data: emergencies,
            };
        }
        catch (error) {
            return {
                statusCode: 400,
                success: false,
                message: error.message,
            };
        }
    }
    async acknowledgeEmergency(id) {
        try {
            const emergency = await this.medicalService.acknowledgeEmergency(id);
            return {
                statusCode: 200,
                success: true,
                message: "Urgence acknowledged",
                data: emergency,
            };
        }
        catch (error) {
            return {
                statusCode: 400,
                success: false,
                message: error.message,
            };
        }
    }
    async resolveEmergency(id, body) {
        try {
            const emergency = await this.medicalService.resolveEmergency(id, body?.notes);
            return {
                statusCode: 200,
                success: true,
                message: "Urgence resolved",
                data: emergency,
            };
        }
        catch (error) {
            return {
                statusCode: 400,
                success: false,
                message: error.message,
            };
        }
    }
    async logTreatment(body, req) {
        try {
            const log = await this.medicalService.createTreatmentLog(req.user.userId, body);
            return { statusCode: 201, success: true, data: log };
        }
        catch (error) {
            return { statusCode: 400, success: false, message: error.message };
        }
    }
    async getMyTreatmentProgress(req) {
        try {
            const progress = await this.medicalService.getTreatmentProgress(req.user.userId);
            return { statusCode: 200, success: true, data: progress };
        }
        catch (error) {
            return { statusCode: 400, success: false, message: error.message };
        }
    }
    async getPatientTreatmentProgress(patientId, req) {
        try {
            if (req.user.activeRole === user_entity_1.UserRole.PARENT) {
                const isChild = await this.usersService.isChildOfParent(req.user.userId, patientId);
                if (!isChild)
                    throw new common_1.ForbiddenException("Vous ne pouvez consulter que les traitements de vos enfants.");
            }
            const progress = await this.medicalService.getTreatmentProgress(patientId);
            return { statusCode: 200, success: true, data: progress };
        }
        catch (error) {
            return { statusCode: error instanceof common_1.ForbiddenException ? 403 : 400, success: false, message: error.message };
        }
    }
    async getConsultationTreatmentLogs(id) {
        try {
            const logs = await this.medicalService.getTreatmentLogsByConsultation(id);
            return { statusCode: 200, success: true, data: logs };
        }
        catch (error) {
            return { statusCode: 400, success: false, message: error.message };
        }
    }
    async updateTreatmentLogStatus(id, body, req) {
        try {
            const log = await this.medicalService.updateTreatmentLogStatus(id, req.user.userId, body.status);
            return { statusCode: 200, success: true, data: log };
        }
        catch (error) {
            return { statusCode: 400, success: false, message: error.message };
        }
    }
    async generateTreatmentLogs(id, req) {
        try {
            const consultation = await this.medicalService.findOne(id);
            const patientId = consultation.patient?.id;
            if (!patientId)
                throw new Error("Patient non trouvé pour cette consultation");
            const logs = await this.medicalService.generateTreatmentLogsFromPrescription(id, patientId);
            return { statusCode: 201, success: true, data: logs, message: `${logs.length} entrées de traitement créées` };
        }
        catch (error) {
            return { statusCode: 400, success: false, message: error.message };
        }
    }
    async triage(body) {
        try {
            const result = await this.triageService.analyzeSymptoms(body.symptoms || "");
            return {
                statusCode: 200,
                success: true,
                data: result,
            };
        }
        catch (error) {
            return {
                statusCode: 400,
                success: false,
                message: error.message,
            };
        }
    }
};
exports.MedicalController = MedicalController;
__decorate([
    (0, common_1.Get)("consultations"),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.PATIENT, user_entity_1.UserRole.DOCTOR, user_entity_1.UserRole.ADMIN),
    __param(0, (0, common_1.Query)("patientId")),
    __param(1, (0, common_1.Query)("doctorId")),
    __param(2, (0, common_1.Query)("limit")),
    __param(3, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number, Object]),
    __metadata("design:returntype", Promise)
], MedicalController.prototype, "listConsultations", null);
__decorate([
    (0, common_1.Get)("consultations/:id"),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.PATIENT, user_entity_1.UserRole.DOCTOR, user_entity_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MedicalController.prototype, "getConsultation", null);
__decorate([
    (0, common_1.Post)("consultations"),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.DOCTOR),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], MedicalController.prototype, "createConsultationAPI", null);
__decorate([
    (0, common_1.Get)("patients/:patientId/history"),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.PATIENT, user_entity_1.UserRole.DOCTOR, user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.PARENT),
    __param(0, (0, common_1.Param)("patientId")),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MedicalController.prototype, "getPatientHistory", null);
__decorate([
    (0, common_1.Get)("history"),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.PATIENT, user_entity_1.UserRole.DOCTOR),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MedicalController.prototype, "getHistory", null);
__decorate([
    (0, common_1.Get)("consultations/patient/me"),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.PATIENT, user_entity_1.UserRole.DOCTOR),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MedicalController.prototype, "getMyConsultations", null);
__decorate([
    (0, common_1.Post)("consultation"),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.DOCTOR),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], MedicalController.prototype, "createConsultation", null);
__decorate([
    (0, common_1.Get)("queue"),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.DOCTOR, user_entity_1.UserRole.PHARMACIST),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MedicalController.prototype, "getQueue", null);
__decorate([
    (0, common_1.Get)("patients/latest"),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.DOCTOR, user_entity_1.UserRole.PHARMACIST),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MedicalController.prototype, "getLatestPatients", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)("validate-prescription/:token"),
    __param(0, (0, common_1.Param)("token")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MedicalController.prototype, "validatePrescription", null);
__decorate([
    (0, common_1.Post)("dispense/:token"),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.PHARMACIST),
    __param(0, (0, common_1.Param)("token")),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], MedicalController.prototype, "dispense", null);
__decorate([
    (0, common_1.Post)("consultations/:id/items"),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.DOCTOR),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Array]),
    __metadata("design:returntype", Promise)
], MedicalController.prototype, "addPrescriptionItems", null);
__decorate([
    (0, common_1.Get)("consultations/:id/items"),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.PATIENT, user_entity_1.UserRole.DOCTOR, user_entity_1.UserRole.PARENT),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MedicalController.prototype, "getPrescriptionItems", null);
__decorate([
    (0, common_1.Get)("consultation-items/:token"),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.PHARMACIST, user_entity_1.UserRole.PATIENT),
    __param(0, (0, common_1.Param)("token")),
    __param(1, (0, common_1.Query)("pharmacyId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], MedicalController.prototype, "getItemsWithAvailability", null);
__decorate([
    (0, common_1.Post)("dispense-items/:token"),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.PHARMACIST),
    __param(0, (0, common_1.Param)("token")),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], MedicalController.prototype, "dispenseItems", null);
__decorate([
    (0, common_1.Post)("epidemic-report"),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.DOCTOR),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], MedicalController.prototype, "reportEpidemic", null);
__decorate([
    (0, common_1.Get)("epidemic-reports"),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.DOCTOR, user_entity_1.UserRole.ADMIN),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MedicalController.prototype, "getEpidemicReports", null);
__decorate([
    (0, common_1.Post)("messages"),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.DOCTOR, user_entity_1.UserRole.PATIENT),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], MedicalController.prototype, "sendMessage", null);
__decorate([
    (0, common_1.Get)("messages"),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.DOCTOR, user_entity_1.UserRole.PATIENT),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MedicalController.prototype, "getMessages", null);
__decorate([
    (0, common_1.Get)("notifications"),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.DOCTOR, user_entity_1.UserRole.PATIENT, user_entity_1.UserRole.PHARMACIST),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MedicalController.prototype, "getNotifications", null);
__decorate([
    (0, common_1.Post)("notifications/:id/read"),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.DOCTOR, user_entity_1.UserRole.PATIENT, user_entity_1.UserRole.PHARMACIST),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MedicalController.prototype, "markAsRead", null);
__decorate([
    (0, common_1.Post)("emergency/sos"),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.PATIENT, user_entity_1.UserRole.DOCTOR, user_entity_1.UserRole.ADMIN),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], MedicalController.prototype, "sendEmergency", null);
__decorate([
    (0, common_1.Post)("emergency"),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.PATIENT, user_entity_1.UserRole.DOCTOR, user_entity_1.UserRole.ADMIN),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], MedicalController.prototype, "sendEmergencyCompat", null);
__decorate([
    (0, common_1.Get)("emergency"),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.PATIENT, user_entity_1.UserRole.DOCTOR, user_entity_1.UserRole.ADMIN),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MedicalController.prototype, "getEmergenciesCompat", null);
__decorate([
    (0, common_1.Get)("emergencies"),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.PATIENT, user_entity_1.UserRole.DOCTOR, user_entity_1.UserRole.ADMIN),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MedicalController.prototype, "getEmergencies", null);
__decorate([
    (0, common_1.Post)("emergency/:id/acknowledge"),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.DOCTOR, user_entity_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MedicalController.prototype, "acknowledgeEmergency", null);
__decorate([
    (0, common_1.Post)("emergency/:id/resolve"),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.DOCTOR, user_entity_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MedicalController.prototype, "resolveEmergency", null);
__decorate([
    (0, common_1.Post)("treatment-logs"),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.PATIENT),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], MedicalController.prototype, "logTreatment", null);
__decorate([
    (0, common_1.Get)("treatment-progress"),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.PATIENT, user_entity_1.UserRole.DOCTOR, user_entity_1.UserRole.PARENT),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MedicalController.prototype, "getMyTreatmentProgress", null);
__decorate([
    (0, common_1.Get)("patients/:patientId/treatment-progress"),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.DOCTOR, user_entity_1.UserRole.PARENT, user_entity_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)("patientId")),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MedicalController.prototype, "getPatientTreatmentProgress", null);
__decorate([
    (0, common_1.Get)("consultations/:id/treatment-logs"),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.PATIENT, user_entity_1.UserRole.DOCTOR, user_entity_1.UserRole.PARENT),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MedicalController.prototype, "getConsultationTreatmentLogs", null);
__decorate([
    (0, common_1.Patch)("treatment-logs/:id/status"),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.PATIENT),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], MedicalController.prototype, "updateTreatmentLogStatus", null);
__decorate([
    (0, common_1.Post)("consultations/:id/generate-treatment-logs"),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.DOCTOR),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MedicalController.prototype, "generateTreatmentLogs", null);
__decorate([
    (0, common_1.Post)("triage"),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.PATIENT, user_entity_1.UserRole.DOCTOR),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MedicalController.prototype, "triage", null);
exports.MedicalController = MedicalController = __decorate([
    (0, common_1.Controller)("medical"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [medical_service_1.MedicalService,
        triage_service_1.TriageService,
        users_service_1.UsersService])
], MedicalController);
//# sourceMappingURL=medical.controller.js.map