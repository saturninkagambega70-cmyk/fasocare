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
exports.VaccinationService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const vaccination_record_entity_1 = require("./entities/vaccination-record.entity");
let VaccinationService = class VaccinationService {
    constructor(vaccinationRepository) {
        this.vaccinationRepository = vaccinationRepository;
    }
    async findByPatient(patientId) {
        return this.vaccinationRepository.find({
            where: { patient: { id: patientId } },
            order: { dateAdministered: "DESC" },
        });
    }
    async findLatestForPatient(patientId) {
        return this.vaccinationRepository.findOne({
            where: { patient: { id: patientId } },
            order: { dateAdministered: "DESC" },
        });
    }
    async create(record) {
        const newRecord = this.vaccinationRepository.create(record);
        return this.vaccinationRepository.save(newRecord);
    }
    async getSchedule(patientId) {
        const records = await this.findByPatient(patientId);
        const defaultSchedule = [
            { vaccineName: "BCG (Tuberculose)", dueAge: "0 mois" },
            { vaccineName: "VPO (Polio 0)", dueAge: "0 mois" },
            { vaccineName: "DTC-HepB-Hib (Penta 1)", dueAge: "2 mois" },
            { vaccineName: "VPO (Polio 1)", dueAge: "2 mois" },
            { vaccineName: "DTC-HepB-Hib (Penta 2)", dueAge: "4 mois" },
            { vaccineName: "VPO (Polio 2)", dueAge: "4 mois" },
            { vaccineName: "DTC-HepB-Hib (Penta 3)", dueAge: "6 mois" },
            { vaccineName: "VPO (Polio 3)", dueAge: "6 mois" },
            { vaccineName: "Rougeole", dueAge: "9 mois" },
            { vaccineName: "Fièvre Jaune", dueAge: "9 mois" },
            { vaccineName: "VAR (Rappel Rougeole)", dueAge: "15-18 mois" },
            { vaccineName: "DTC (Rappel 1)", dueAge: "15-18 mois" },
            { vaccineName: "VPO (Rappel)", dueAge: "15-18 mois" },
            { vaccineName: "DTC (Rappel 2)", dueAge: "5-6 ans" },
        ];
        return defaultSchedule.map((v) => ({
            ...v,
            administered: records.some((r) => r.vaccineName
                .toLowerCase()
                .includes(v.vaccineName.split("(")[0].trim().toLowerCase()) ||
                v.vaccineName.toLowerCase().includes(r.vaccineName.toLowerCase())),
            dateAdministered: records.find((r) => r.vaccineName
                .toLowerCase()
                .includes(v.vaccineName.split("(")[0].trim().toLowerCase()))?.dateAdministered || null,
        }));
    }
    async findUpcomingReminders(hoursAhead = 48) {
        const now = new Date();
        const windowEnd = new Date(now.getTime() + hoursAhead * 3600000);
        return this.vaccinationRepository.find({
            where: {
                nextDoseDate: (0, typeorm_2.Between)(now, windowEnd),
            },
            relations: ["patient"],
        });
    }
    async markReminderSent(id) {
        await this.vaccinationRepository.update(id, { reminderSent: true });
    }
};
exports.VaccinationService = VaccinationService;
exports.VaccinationService = VaccinationService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(vaccination_record_entity_1.VaccinationRecord)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], VaccinationService);
//# sourceMappingURL=vaccination.service.js.map