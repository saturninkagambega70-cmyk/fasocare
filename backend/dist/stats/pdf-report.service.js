"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PdfReportService = void 0;
const common_1 = require("@nestjs/common");
const pdfkit_1 = __importDefault(require("pdfkit"));
let PdfReportService = class PdfReportService {
    async generateWeeklyReport(data) {
        return new Promise((resolve, reject) => {
            try {
                const doc = new pdfkit_1.default({ margin: 50 });
                const buffers = [];
                doc.on("data", buffers.push.bind(buffers));
                doc.on("end", () => {
                    const pdfData = Buffer.concat(buffers);
                    resolve(pdfData);
                });
                doc
                    .fontSize(20)
                    .text("Gouvernement du Burkina Faso", { align: "center" });
                doc
                    .fontSize(14)
                    .text("Ministère de la Santé et de l'Hygiène Publique", {
                    align: "center",
                });
                doc.moveDown();
                doc
                    .fontSize(18)
                    .text("Rapport Épidémiologique et Sanitaire Hebdomadaire", {
                    align: "center",
                    underline: true,
                });
                doc.moveDown(2);
                doc
                    .fontSize(12)
                    .text(`Date d'export : ${new Date().toLocaleDateString("fr-FR")}`, {
                    align: "right",
                });
                doc.moveDown();
                doc.fontSize(16).text("1. Indicateurs Globaux");
                doc.moveDown(0.5);
                doc
                    .fontSize(12)
                    .text(`Citoyens Enregistrés : ${data.stats.citizens}`)
                    .text(`Taux de Couverture Vaccinale : ${data.stats.vaccinationRate}%`)
                    .text(`Consultations (Dernières 24h) : ${data.stats.consultations}`)
                    .text(`Alertes de Stocks critiques : ${data.stats.stockAlerts}`);
                doc.moveDown();
                doc.fontSize(16).text("2. Tendances et Alertes");
                doc.moveDown(0.5);
                doc
                    .fontSize(12)
                    .text(`Tendance Inscriptions (30j) : ${data.stats.trends.citizens}`)
                    .text(`Tendance Consultations (24h) : ${data.stats.trends.consultations}`);
                doc.moveDown();
                if (data.heatmap && data.heatmap.zones) {
                    doc.fontSize(16).text("3. Zones Critiques (Épidémies)");
                    doc.moveDown(0.5);
                    data.heatmap.zones.forEach((zone) => {
                        if (zone.severity === "CRITICAL" || zone.severity === "MODERATE") {
                            doc
                                .fontSize(12)
                                .text(`- ${zone.name} : ${zone.cases} cas signalés. Facteurs de risque: ${zone.diseases.join(", ")}`);
                        }
                    });
                }
                doc.moveDown(2);
                doc
                    .fillColor("grey")
                    .fontSize(10)
                    .text("Document généré automatiquement par la plateforme FasoCare.", {
                    align: "center",
                });
                doc.end();
            }
            catch (error) {
                reject(error);
            }
        });
    }
};
exports.PdfReportService = PdfReportService;
exports.PdfReportService = PdfReportService = __decorate([
    (0, common_1.Injectable)()
], PdfReportService);
//# sourceMappingURL=pdf-report.service.js.map