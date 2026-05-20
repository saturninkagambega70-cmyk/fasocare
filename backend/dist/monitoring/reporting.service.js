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
exports.ReportingService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const pdfkit_1 = __importDefault(require("pdfkit"));
const consultation_entity_1 = require("../medical/entities/consultation.entity");
const vaccination_record_entity_1 = require("../vaccination/entities/vaccination-record.entity");
const medicine_stock_entity_1 = require("../pharmacy/entities/medicine-stock.entity");
let ReportingService = class ReportingService {
    constructor(consultationRepo, vaccinationRepo, stockRepo) {
        this.consultationRepo = consultationRepo;
        this.vaccinationRepo = vaccinationRepo;
        this.stockRepo = stockRepo;
    }
    async generateWeeklySummary() {
        const lastWeek = new Date();
        lastWeek.setDate(lastWeek.getDate() - 7);
        const consultations = await this.consultationRepo.count({
            where: { createdAt: (0, typeorm_2.Between)(lastWeek, new Date()) },
        });
        const vaccinations = await this.vaccinationRepo.count({
            where: { dateAdministered: (0, typeorm_2.Between)(lastWeek, new Date()) },
        });
        return new Promise((resolve) => {
            const doc = new pdfkit_1.default({ margin: 50, size: "A4" });
            const chunks = [];
            doc.on("data", (chunk) => chunks.push(chunk));
            doc.on("end", () => resolve(Buffer.concat(chunks)));
            this.addHeader(doc, "RAPPORT HEBDOMADAIRE D'ACTIVITÉ");
            doc.moveDown(2);
            doc
                .font("Helvetica-Bold")
                .fontSize(14)
                .text("Résumé Statistique (7 derniers jours)");
            doc.moveDown(1);
            doc
                .font("Helvetica")
                .fontSize(12)
                .text(`Nombre de consultations : ${consultations}`);
            doc.text(`Nombre de vaccinations effectuées : ${vaccinations}`);
            doc.moveDown(2);
            doc
                .fontSize(10)
                .fillColor("grey")
                .text("Généré automatiquement par FasoCare Monitoring Service.", {
                align: "center",
            });
            doc.end();
        });
    }
    async generateStockAudit() {
        const lowStock = await this.stockRepo.find({
            where: { quantity: (0, typeorm_2.LessThan)(10) },
            relations: ["pharmacy"],
        });
        return new Promise((resolve) => {
            const doc = new pdfkit_1.default({ margin: 50, size: "A4" });
            const chunks = [];
            doc.on("data", (chunk) => chunks.push(chunk));
            doc.on("end", () => resolve(Buffer.concat(chunks)));
            this.addHeader(doc, "AUDIT DES STOCKS ET ALERTES RUPTURES");
            doc.moveDown(2);
            doc
                .font("Helvetica-Bold")
                .fontSize(14)
                .text("Articles en seuil critique (< 10 unités)");
            doc.moveDown(1);
            if (lowStock.length === 0) {
                doc.font("Helvetica").text("Aucune rupture critique détectée.");
            }
            else {
                lowStock.forEach((item) => {
                    doc
                        .font("Helvetica-Bold")
                        .text(`${item.medicineName}`, { continued: true });
                    doc
                        .font("Helvetica")
                        .text(` : ${item.quantity} unités (Pharmacie: ${item.pharmacy?.name || "Inconnue"})`);
                });
            }
            doc.moveDown(2);
            doc
                .fontSize(10)
                .fillColor("grey")
                .text("Rapport généré le " + new Date().toLocaleDateString(), {
                align: "center",
            });
            doc.end();
        });
    }
    addHeader(doc, title) {
        doc
            .font("Helvetica-Bold")
            .fontSize(14)
            .text("RÉPUBLIQUE DU BURKINA FASO", { align: "center" });
        doc
            .font("Helvetica-Oblique")
            .fontSize(9)
            .text("Unité - Progrès - Justice", { align: "center" });
        doc.moveDown(0.5);
        doc
            .font("Helvetica")
            .fontSize(11)
            .text("MINISTÈRE DE LA SANTÉ ET DE L'HYGIÈNE PUBLIQUE", {
            align: "center",
        });
        doc.moveDown(1);
        doc.rect(50, doc.y, 500, 30).fill("#1a4a2e");
        doc
            .fillColor("white")
            .font("Helvetica-Bold")
            .fontSize(14)
            .text(title, 50, doc.y + 8, { align: "center" });
        doc.fillColor("black").moveDown(1);
    }
};
exports.ReportingService = ReportingService;
exports.ReportingService = ReportingService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(consultation_entity_1.Consultation)),
    __param(1, (0, typeorm_1.InjectRepository)(vaccination_record_entity_1.VaccinationRecord)),
    __param(2, (0, typeorm_1.InjectRepository)(medicine_stock_entity_1.MedicineStock)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ReportingService);
//# sourceMappingURL=reporting.service.js.map