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
exports.MedicalService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const consultation_entity_1 = require("./entities/consultation.entity");
const prescription_item_entity_1 = require("./entities/prescription-item.entity");
const epidemic_report_entity_1 = require("./entities/epidemic-report.entity");
const message_entity_1 = require("./entities/message.entity");
const notification_entity_1 = require("./entities/notification.entity");
const emergency_entity_1 = require("./entities/emergency.entity");
const treatment_log_entity_1 = require("./entities/treatment-log.entity");
const qr_service_1 = require("./qr.service");
const pharmacy_service_1 = require("../pharmacy/pharmacy.service");
const users_service_1 = require("../users/users.service");
let MedicalService = class MedicalService {
    constructor(consultationRepository, itemRepository, epidemicReportRepository, messageRepository, notificationRepository, emergencyRepository, treatmentLogRepository, qrService, pharmacyService, usersService) {
        this.consultationRepository = consultationRepository;
        this.itemRepository = itemRepository;
        this.epidemicReportRepository = epidemicReportRepository;
        this.messageRepository = messageRepository;
        this.notificationRepository = notificationRepository;
        this.emergencyRepository = emergencyRepository;
        this.treatmentLogRepository = treatmentLogRepository;
        this.qrService = qrService;
        this.pharmacyService = pharmacyService;
        this.usersService = usersService;
    }
    async findAllByPatient(patientId) {
        return this.consultationRepository.find({
            where: { patient: { id: patientId } },
            relations: ["doctor", "items"],
            order: { createdAt: "DESC" },
        });
    }
    async findAllByDoctor(doctorId) {
        return this.consultationRepository.find({
            where: { doctor: { id: doctorId } },
            relations: ["patient", "items"],
            order: { createdAt: "DESC" },
        });
    }
    async findOne(id) {
        const consultation = await this.consultationRepository.findOne({
            where: { id },
            relations: ["patient", "doctor", "items"],
        });
        if (!consultation)
            throw new common_1.NotFoundException("Consultation non trouvée");
        return consultation;
    }
    async create(consultationData) {
        const consultation = this.consultationRepository.create(consultationData);
        if (consultation.prescription) {
        }
        const savedConsultation = await this.consultationRepository.save(consultation);
        if (savedConsultation.diagnosis) {
            await this.detectAndReportEpidemic(savedConsultation);
        }
        if (savedConsultation.prescription && !savedConsultation.qr_token) {
            const prescriptionText = typeof savedConsultation.prescription === "string"
                ? savedConsultation.prescription
                : JSON.stringify(savedConsultation.prescription);
            const doctorId = consultationData.doctor?.id || savedConsultation.doctor?.id;
            savedConsultation.qr_token = this.qrService.generatePrescriptionToken(savedConsultation.id, prescriptionText, doctorId);
            savedConsultation.qr_expiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
            return this.consultationRepository.save(savedConsultation);
        }
        return savedConsultation;
    }
    async detectAndReportEpidemic(consultation) {
        if (!consultation.diagnosis)
            return;
        const diagnosis = consultation.diagnosis.toLowerCase();
        const epidemicDiseases = [
            { name: "Paludisme", keywords: ["palu", "malaria", "plasmodium"] },
            { name: "Dengue", keywords: ["dengue", "flavivirus"] },
            {
                name: "Méningite",
                keywords: ["méningite", "meningitis", "raideur nucale"],
            },
            { name: "Choléra", keywords: ["choléra", "cholera", "vibrion"] },
            { name: "Rougeole", keywords: ["rougeole", "measles"] },
            { name: "Fièvre Jaune", keywords: ["jaune", "yellow fever"] },
        ];
        for (const disease of epidemicDiseases) {
            if (disease.keywords.some((k) => diagnosis.includes(k))) {
                try {
                    const doctorRef = consultation.doctor?.id
                        ? { id: consultation.doctor.id }
                        : consultation.doctor;
                    await this.epidemicReportRepository.save({
                        disease: disease.name,
                        casesCount: 1,
                        location: consultation.hospital || "Inconnu",
                        notes: `Détection automatique via consultation ID ${consultation.id}. Diagnostic: ${consultation.diagnosis}`,
                        doctor: doctorRef,
                        status: "SUBMITTED",
                    });
                    console.log(`[EPIDEMIC AUTO-REPORT] ${disease.name} détecté à ${consultation.hospital || "Inconnu"}`);
                }
                catch (err) {
                    console.error("[EPIDEMIC AUTO-REPORT] Erreur de sauvegarde:", err);
                }
                break;
            }
        }
    }
    async getQueue() {
        return this.consultationRepository.find({
            relations: ["patient", "doctor"],
            order: { createdAt: "DESC" },
            take: 20,
        });
    }
    async validatePrescription(token) {
        const isValid = this.qrService.validateToken(token);
        if (!isValid)
            throw new common_1.NotFoundException("Token QR invalide ou altéré");
        const parts = token.split(".")[0].split("-");
        const type = parts[0];
        if (type !== "RX")
            throw new common_1.NotFoundException("Ce n'est pas un token d'ordonnance");
        const cleanId = parts[1];
        const id = `${cleanId.substring(0, 8)}-${cleanId.substring(8, 12)}-${cleanId.substring(12, 16)}-${cleanId.substring(16, 20)}-${cleanId.substring(20)}`;
        const consultation = await this.findOne(id);
        if (!consultation.qr_expiry ||
            consultation.qr_expiry.getTime() < Date.now()) {
            throw new common_1.GoneException("L'ordonnance a expiré (validité 24h)");
        }
        const prescriptionText = typeof consultation.prescription === "string"
            ? consultation.prescription
            : JSON.stringify(consultation.prescription);
        if (prescriptionText &&
            !this.qrService.validatePrescriptionIntegrity(token, prescriptionText)) {
            throw new common_1.ConflictException("Alerte de sécurité: Le contenu de la prescription a été altéré depuis son émission.");
        }
        return consultation;
    }
    async dispense(token, pharmacistId, pharmacyId) {
        const consultation = await this.validatePrescription(token);
        if (consultation.isDispensed) {
            throw new common_1.ConflictException("Cette ordonnance a déjà été délivrée.");
        }
        consultation.isDispensed = true;
        consultation.dispensedAt = new Date();
        const saved = await this.consultationRepository.save(consultation);
        if (pharmacistId) {
            try {
                let pid = pharmacyId;
                if (!pid) {
                    const pharmacy = await this.pharmacyService.findByPharmacist(pharmacistId);
                    if (pharmacy)
                        pid = pharmacy.id;
                }
                if (pid) {
                    const prescriptionText = typeof consultation.prescription === "string"
                        ? consultation.prescription
                        : JSON.stringify(consultation.prescription || "");
                    await this.pharmacyService.linkPrescription({
                        pharmacyId: pid,
                        consultationId: consultation.id,
                        pharmacistId,
                        medicineName: prescriptionText.substring(0, 100),
                        quantityDispensed: 1,
                    });
                    try {
                        await this.pharmacyService.deductFromStock(pid, prescriptionText, 1);
                    }
                    catch { }
                }
            }
            catch { }
        }
        return saved;
    }
    async getItemsForConsultation(consultationId) {
        const items = await this.itemRepository.find({
            where: { consultation: { id: consultationId } },
            order: { createdAt: "ASC" },
        });
        const dispensations = await this.pharmacyService.getDispensationsByConsultation(consultationId);
        return items.map((item) => {
            const disp = item.status === "DISPENSED"
                ? dispensations.find((d) => d.medicineName?.toLowerCase() ===
                    item.medicineName.toLowerCase())
                : null;
            return {
                ...item,
                cachet: disp
                    ? {
                        pharmacyName: disp.pharmacyName,
                        pharmacyPhone: disp.pharmacyPhone,
                        pharmacistName: disp.pharmacistName,
                        pharmacistLicense: disp.pharmacistLicense,
                        dispensedAt: disp.dispensedAt,
                        cachetToken: disp.cachetToken,
                    }
                    : null,
            };
        });
    }
    async addPrescriptionItems(consultationId, items) {
        const consultation = await this.findOne(consultationId);
        const entities = items.map((item) => this.itemRepository.create({
            consultation,
            medicineName: item.medicineName,
            dosage: item.dosage || null,
            quantity: item.quantity || 1,
            timeOfDay: item.timeOfDay || null,
            status: prescription_item_entity_1.ItemStatus.PENDING,
        }));
        const savedItems = await this.itemRepository.save(entities);
        const patientId = consultation.patient?.id;
        if (patientId) {
            const scheduleMap = {
                "Matin": "08:00",
                "Midi": "12:00",
                "Soir": "20:00",
                "Matin et Soir": "08:00 - 20:00",
                "Matin, Midi et Soir": "08:00 - 12:00 - 20:00",
                "Toutes les 8h": "08:00 - 16:00 - 00:00",
            };
            const logs = savedItems.flatMap((item) => {
                const tod = item.timeOfDay || "Matin";
                const times = (scheduleMap[tod] || "08:00").split(" - ");
                return times.map((time) => this.treatmentLogRepository.create({
                    consultation: { id: consultation.id },
                    item: { id: item.id },
                    patient: { id: patientId },
                    scheduledTime: time,
                    status: treatment_log_entity_1.TreatmentLogStatus.TAKEN,
                }));
            });
            await this.treatmentLogRepository.save(logs);
        }
        return savedItems;
    }
    async getItemsWithAvailability(token, pharmacyId) {
        const consultation = await this.validatePrescription(token);
        const items = await this.itemRepository.find({
            where: { consultation: { id: consultation.id } },
            order: { createdAt: "ASC" },
        });
        let stockMap = {};
        if (pharmacyId) {
            const stocks = await this.pharmacyService.getStock(pharmacyId);
            for (const s of stocks) {
                stockMap[s.medicineName.toLowerCase()] =
                    (stockMap[s.medicineName.toLowerCase()] || 0) + s.quantity;
            }
        }
        return {
            consultationId: consultation.id,
            isDispensed: consultation.isDispensed,
            items: items.map((item) => ({
                id: item.id,
                medicineName: item.medicineName,
                dosage: item.dosage,
                quantity: item.quantity,
                status: item.status,
                stockDispo: stockMap[item.medicineName.toLowerCase()] || 0,
                disponible: (stockMap[item.medicineName.toLowerCase()] || 0) >= item.quantity,
            })),
        };
    }
    async dispenseItems(token, pharmacistId, pharmacyId, dispensedItems) {
        const consultation = await this.validatePrescription(token);
        const allItems = await this.itemRepository.find({
            where: { consultation: { id: consultation.id } },
        });
        if (allItems.length === 0) {
            throw new common_1.NotFoundException("Cette ordonnance n'a pas d'articles. Utilisez l'ancien flux de dispense.");
        }
        let pid = pharmacyId;
        if (!pid) {
            const pharmacy = await this.pharmacyService.findByPharmacist(pharmacistId);
            if (pharmacy)
                pid = pharmacy.id;
        }
        for (const di of dispensedItems) {
            const item = allItems.find((i) => i.id === di.id);
            if (!item)
                continue;
            if (item.status !== prescription_item_entity_1.ItemStatus.PENDING)
                continue;
            item.status = di.status;
            await this.itemRepository.save(item);
            if (di.status === "DISPENSED" && pid) {
                const pharmUser = await this.usersService.findById(pharmacistId);
                const pharmacy = await this.pharmacyService.findByPharmacist(pharmacistId);
                await this.pharmacyService.linkPrescription({
                    pharmacyId: pid,
                    consultationId: consultation.id,
                    pharmacistId,
                    medicineName: item.medicineName,
                    quantityDispensed: item.quantity,
                    pharmacistName: pharmUser?.name || undefined,
                    pharmacistLicense: pharmUser?.licenseNumber || undefined,
                    pharmacyName: pharmacy?.name || undefined,
                    pharmacyPhone: pharmacy?.phone || undefined,
                });
                try {
                    await this.pharmacyService.deductFromStock(pid, item.medicineName, item.quantity);
                }
                catch { }
            }
        }
        const allDone = allItems.every((i) => i.status === prescription_item_entity_1.ItemStatus.DISPENSED ||
            i.status === prescription_item_entity_1.ItemStatus.UNAVAILABLE);
        if (allDone) {
            consultation.isDispensed = true;
            consultation.dispensedAt = new Date();
            await this.consultationRepository.save(consultation);
        }
        return this.getItemsWithAvailability(token, pid);
    }
    async createTreatmentLog(patientId, dto) {
        const consultation = await this.findOne(dto.consultationId);
        const item = await this.itemRepository.findOne({ where: { id: dto.itemId } });
        if (!item)
            throw new common_1.NotFoundException("Médicament non trouvé");
        const log = this.treatmentLogRepository.create({
            consultation: { id: consultation.id },
            item: { id: item.id },
            patient: { id: patientId },
            scheduledTime: dto.scheduledTime,
            status: dto.status || treatment_log_entity_1.TreatmentLogStatus.TAKEN,
            takenAt: dto.status === treatment_log_entity_1.TreatmentLogStatus.SKIPPED ? null : new Date(),
        });
        return this.treatmentLogRepository.save(log);
    }
    async getTreatmentLogsByConsultation(consultationId) {
        return this.treatmentLogRepository.find({
            where: { consultation: { id: consultationId } },
            relations: ["item", "confirmedBy"],
            order: { scheduledTime: "ASC" },
        });
    }
    async getTreatmentProgress(patientId) {
        const logs = await this.treatmentLogRepository.find({
            where: { patient: { id: patientId } },
            relations: ["consultation", "item", "confirmedBy"],
            order: { createdAt: "DESC" },
            take: 100,
        });
        const total = logs.length;
        const taken = logs.filter((l) => l.status === treatment_log_entity_1.TreatmentLogStatus.TAKEN || l.status === treatment_log_entity_1.TreatmentLogStatus.CONFIRMED).length;
        const adherenceRate = total > 0 ? Math.round((taken / total) * 100) : 0;
        return {
            logs,
            summary: { total, taken, skipped: total - taken, adherenceRate },
        };
    }
    async updateTreatmentLogStatus(logId, patientId, status) {
        const log = await this.treatmentLogRepository.findOne({
            where: { id: logId },
            relations: ["patient"],
        });
        if (!log)
            throw new common_1.NotFoundException("Entrée de traitement non trouvée");
        if (log.patient?.id !== patientId)
            throw new common_1.ForbiddenException("Vous ne pouvez modifier que votre propre suivi");
        log.status = status;
        log.takenAt = status === treatment_log_entity_1.TreatmentLogStatus.SKIPPED ? null : new Date();
        return this.treatmentLogRepository.save(log);
    }
    async generateTreatmentLogsFromPrescription(consultationId, patientId) {
        const items = await this.itemRepository.find({
            where: { consultation: { id: consultationId } },
        });
        if (items.length === 0)
            return [];
        const scheduleMap = {
            "Matin": "08:00",
            "Midi": "12:00",
            "Soir": "20:00",
            "Matin et Soir": "08:00 - 20:00",
            "Matin, Midi et Soir": "08:00 - 12:00 - 20:00",
            "Toutes les 8h": "08:00 - 16:00 - 00:00",
        };
        const logs = items.flatMap((item) => {
            const tod = item.timeOfDay || "Matin";
            const times = (scheduleMap[tod] || "08:00").split(" - ");
            return times.map((time) => this.treatmentLogRepository.create({
                consultation: { id: consultationId },
                item: { id: item.id },
                patient: { id: patientId },
                scheduledTime: time,
                status: treatment_log_entity_1.TreatmentLogStatus.TAKEN,
            }));
        });
        return this.treatmentLogRepository.save(logs);
    }
    async reportEpidemic(doctor, reportData) {
        const report = this.epidemicReportRepository.create({
            ...reportData,
            doctor: { id: doctor.userId },
        });
        return this.epidemicReportRepository.save(report);
    }
    async getEpidemicReports(doctorId) {
        return this.epidemicReportRepository.find({
            where: doctorId ? { doctor: { id: doctorId } } : {},
            relations: ["doctor"],
            order: { createdAt: "DESC" },
        });
    }
    async sendMessage(sender, receiverId, content) {
        const message = this.messageRepository.create({
            sender: { id: sender.userId },
            receiver: { id: receiverId },
            content,
        });
        return this.messageRepository.save(message);
    }
    async getMessages(userId) {
        return this.messageRepository.find({
            where: [{ sender: { id: userId } }, { receiver: { id: userId } }],
            relations: ["sender", "receiver"],
            order: { createdAt: "DESC" },
        });
    }
    async getNotifications(userId) {
        return this.notificationRepository.find({
            where: { user: { id: userId } },
            order: { createdAt: "DESC" },
            take: 50,
        });
    }
    async markNotificationAsRead(id, userId) {
        const notification = await this.notificationRepository.findOne({
            where: { id },
            relations: ["user"],
        });
        if (!notification) {
            throw new common_1.NotFoundException("Notification introuvable");
        }
        if (notification.user?.id !== userId) {
            throw new common_1.ForbiddenException("Accès interdit à cette notification");
        }
        await this.notificationRepository.update(id, { isRead: true });
    }
    async createNotification(userId, title, content, type, metadata) {
        const notification = this.notificationRepository.create({
            user: { id: userId },
            title,
            content,
            type,
            metadata,
        });
        return this.notificationRepository.save(notification);
    }
    async sendEmergency(caller, payload) {
        const emergency = this.emergencyRepository.create({
            caller: { id: caller.userId },
            description: payload.description || "Appel d'urgence SOS",
            latitude: payload.latitude,
            longitude: payload.longitude,
            address: payload.address,
            priority: payload.priority || "CRITICAL",
            serviceType: payload.serviceType || "MEDICAL",
            status: "PENDING",
        });
        const savedEmergency = await this.emergencyRepository.save(emergency);
        console.log(`[EMERGENCY] SOS reçu de ${caller.phone} - ${JSON.stringify(payload)}`);
        return savedEmergency;
    }
    async getEmergencies(userId) {
        return this.emergencyRepository.find({
            where: { caller: { id: userId } },
            relations: ["caller"],
            order: { createdAt: "DESC" },
            take: 50,
        });
    }
    async acknowledgeEmergency(emergencyId) {
        const emergency = await this.emergencyRepository.findOne({
            where: { id: emergencyId },
        });
        if (!emergency) {
            throw new common_1.NotFoundException("Urgence non trouvée");
        }
        emergency.status = "ACKNOWLEDGED";
        emergency.acknowledgedAt = new Date();
        return this.emergencyRepository.save(emergency);
    }
    async resolveEmergency(emergencyId, notes) {
        const emergency = await this.emergencyRepository.findOne({
            where: { id: emergencyId },
        });
        if (!emergency) {
            throw new common_1.NotFoundException("Urgence non trouvée");
        }
        emergency.status = "RESOLVED";
        emergency.resolvedAt = new Date();
        if (notes)
            emergency.notes = notes;
        return this.emergencyRepository.save(emergency);
    }
};
exports.MedicalService = MedicalService;
exports.MedicalService = MedicalService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(consultation_entity_1.Consultation)),
    __param(1, (0, typeorm_1.InjectRepository)(prescription_item_entity_1.PrescriptionItem)),
    __param(2, (0, typeorm_1.InjectRepository)(epidemic_report_entity_1.EpidemicReport)),
    __param(3, (0, typeorm_1.InjectRepository)(message_entity_1.Message)),
    __param(4, (0, typeorm_1.InjectRepository)(notification_entity_1.Notification)),
    __param(5, (0, typeorm_1.InjectRepository)(emergency_entity_1.Emergency)),
    __param(6, (0, typeorm_1.InjectRepository)(treatment_log_entity_1.TreatmentLog)),
    __param(8, (0, common_1.Inject)((0, common_1.forwardRef)(() => pharmacy_service_1.PharmacyService))),
    __param(9, (0, common_1.Inject)((0, common_1.forwardRef)(() => users_service_1.UsersService))),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        qr_service_1.QrService,
        pharmacy_service_1.PharmacyService,
        users_service_1.UsersService])
], MedicalService);
//# sourceMappingURL=medical.service.js.map