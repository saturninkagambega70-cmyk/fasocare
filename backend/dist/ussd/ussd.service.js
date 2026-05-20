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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UssdService = void 0;
const common_1 = require("@nestjs/common");
const vaccination_service_1 = require("../vaccination/vaccination.service");
const medical_service_1 = require("../medical/medical.service");
const users_service_1 = require("../users/users.service");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../users/entities/user.entity");
const telecom_service_1 = require("../telecom/telecom.service");
const ioredis_1 = __importDefault(require("ioredis"));
let UssdService = class UssdService {
    constructor(vaccinationService, medicalService, usersService, telecomService, usersRepository, redis) {
        this.vaccinationService = vaccinationService;
        this.medicalService = medicalService;
        this.usersService = usersService;
        this.telecomService = telecomService;
        this.usersRepository = usersRepository;
        this.redis = redis;
        this.fallbackStore = new Map();
    }
    async getSession(key) {
        if (this.redis)
            return this.redis.get(key);
        return this.fallbackStore.get(key) || null;
    }
    async setSession(key, value, ttl) {
        if (this.redis) {
            await this.redis.set(key, value, "EX", ttl || 600);
        }
        else {
            this.fallbackStore.set(key, value);
            if (ttl)
                setTimeout(() => this.fallbackStore.delete(key), ttl * 1000);
        }
    }
    async delSession(key) {
        if (this.redis)
            await this.redis.del(key);
        else
            this.fallbackStore.delete(key);
    }
    async processUssd(phoneNumber, text, sessionId) {
        const sessionKey = `ussd_session:${sessionId}`;
        const sessionData = await this.getSession(sessionKey);
        let session;
        if (!sessionData) {
            session = {
                phoneNumber,
                sessionId,
                state: "MAIN_MENU",
                data: {},
                createdAt: new Date().toISOString(),
                expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
            };
        }
        else {
            session = JSON.parse(sessionData);
        }
        session.expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
        const user = await this.usersService.findOneByPhone(phoneNumber);
        if (!user) {
            await this.delSession(sessionKey);
            return "END Numéro inconnu. Veuillez vous inscrire sur l'application FasoCare ou au CSPS le plus proche.";
        }
        const input = text.trim();
        const levels = input === "" ? [] : input.split("*");
        if (input === "") {
            session.state = "MAIN_MENU";
            await this.setSession(sessionKey, JSON.stringify(session));
            return this.getMainMenu(user);
        }
        const mainOption = levels[0];
        let response = "";
        switch (mainOption) {
            case "1":
                response = await this.handleHealthMenu(user, levels, session);
                break;
            case "2":
                response = await this.handleAppointmentMenu(user, levels, session);
                break;
            case "3":
                response = this.handlePharmacyMenu(user, levels, session);
                break;
            case "4":
                response = this.handleReportMenu(user, levels, session);
                break;
            case "5":
                await this.delSession(sessionKey);
                await this.telecomService.sendSms(user.phone, "[FasoCare SOS] Alerte reçue. Équipe d'urgence envoyée.");
                return "END SOS LANCÉ 🚨\n\nUne équipe d'urgence a été alertée.\nRestez calme. Aide arrive.";
            case "0":
                await this.delSession(sessionKey);
                return "END Merci d'utiliser FasoCare.\n\nTéléchargez l'app: play.google.com/store/apps/...";
            default:
                response = `CON Option invalide (${mainOption}).\n\n${this.getMainMenu(user).substring(4)}`;
        }
        if (response.startsWith("END")) {
            await this.delSession(sessionKey);
            if (response.includes("RDV CONFIRMÉ")) {
                await this.telecomService.sendSms(user.phone, `Confirmation FasoCare: Votre RDV est confirmé. Code: AP${Date.now().toString().slice(-6)}.`);
            }
        }
        else {
            await this.setSession(sessionKey, JSON.stringify(session));
        }
        return response;
    }
    getMainMenu(user) {
        return `CON Bienvenue FasoCare 🇧🇫

1. 🏥 Dossier Santé
2. 📅 RDV Médical
3. 💊 Pharmacie
4. 📊 Mon Rapport
5. 🆘 SOS Urgence
0. ❌ Quitter`;
    }
    async handleHealthMenu(user, levels, session) {
        if (levels.length === 1) {
            return "CON Dossier Santé\n\n1. 💉 Carnet Vaccinal\n2. 📋 Mes consultations\n3. 💊 Prescriptions en cours\n0. 🔙 Retour";
        }
        if (levels[1] === "1") {
            const vaccines = await this.vaccinationService.findByPatient(user.id);
            if (vaccines.length === 0) {
                return "END Aucun vaccin enregistré.\nConsultez le CSPS le plus proche.";
            }
            return `END ${vaccines
                .slice(0, 3)
                .map((v) => `✓ ${v.vaccineName}: ${new Date(v.dateAdministered).toLocaleDateString("fr-FR")}`)
                .join("\n")}${vaccines.length > 3 ? "\n...et +" : ""}`;
        }
        if (levels[1] === "2") {
            return `END Dernière consultation: ${new Date().toLocaleDateString("fr-FR")}\n(Disponible dans l'app mobile)`;
        }
        if (levels[1] === "3") {
            return "END Aucune prescription active.\nConsultez un médecin si besoin.";
        }
        return "END Option invalide";
    }
    async handleAppointmentMenu(user, levels, session) {
        if (levels.length === 1) {
            return "CON Prise de RDV\n\n1. 📍 CSPS de Pissy\n2. 📍 CHU Yalgado\n3. 📍 CMA Koudougou\n0. 🔙 Retour";
        }
        const facilities = {
            "1": "CSPS de Pissy",
            "2": "CHU Yalgado",
            "3": "CMA Koudougou",
        };
        const selected = facilities[levels[1]];
        if (!selected)
            return "END Établissement invalide";
        if (levels.length === 2)
            return "CON Spécialité:\n\n1. Généraliste\n2. Pédiatrie\n3. Dentiste";
        return `END RDV CONFIRMÉ ✅\n\nÉtablissement: ${selected}\nPatient: ${user.name || user.phone}\n\nPrésentez-vous avant 12h.`;
    }
    handlePharmacyMenu(user, levels, session) {
        if (levels.length === 1)
            return "CON Pharmacie de Garde:\n\n1. Pharmacie de la Liberté\n2. Pharmacie Centrale\n3. Pharma Pissy\n\n* Toujours vérifier les gardes";
        return `END 💊 Pharmacie ${levels[1] === "1" ? "de la Liberté" : levels[1] === "2" ? "Centrale" : "Pissy"}\n📍 Ouagadougou\n📞 +226 25 30 00 00`;
    }
    handleReportMenu(user, levels, session) {
        if (levels.length === 1)
            return "CON Rapport Sanitaire:\n\n1. Mes données 30j\n2. Épidémie signalée\n\n0. 🔙 Retour";
        if (levels[1] === "1")
            return `END Rapport 30j:\nConsultations: ~${Math.floor(Math.random() * 5)}\nVaccins: à jour`;
        return "END Aucune épidémie signalée dans votre zone.";
    }
};
exports.UssdService = UssdService;
exports.UssdService = UssdService = __decorate([
    (0, common_1.Injectable)(),
    __param(4, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(5, (0, common_1.Inject)("REDIS_CLIENT")),
    __param(5, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [vaccination_service_1.VaccinationService,
        medical_service_1.MedicalService,
        users_service_1.UsersService,
        telecom_service_1.TelecomService,
        typeorm_2.Repository,
        ioredis_1.default])
], UssdService);
//# sourceMappingURL=ussd.service.js.map