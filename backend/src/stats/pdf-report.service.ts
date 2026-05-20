import { Injectable } from "@nestjs/common";
import PDFDocument from "pdfkit";

@Injectable()
export class PdfReportService {
  async generateWeeklyReport(data: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const buffers: Buffer[] = [];

        doc.on("data", buffers.push.bind(buffers));
        doc.on("end", () => {
          const pdfData = Buffer.concat(buffers);
          resolve(pdfData);
        });

        // Header
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

        // Date
        doc
          .fontSize(12)
          .text(`Date d'export : ${new Date().toLocaleDateString("fr-FR")}`, {
            align: "right",
          });
        doc.moveDown();

        // Section 1: Dashboard Stats
        doc.fontSize(16).text("1. Indicateurs Globaux");
        doc.moveDown(0.5);
        doc
          .fontSize(12)
          .text(`Citoyens Enregistrés : ${data.stats.citizens}`)
          .text(`Taux de Couverture Vaccinale : ${data.stats.vaccinationRate}%`)
          .text(`Consultations (Dernières 24h) : ${data.stats.consultations}`)
          .text(`Alertes de Stocks critiques : ${data.stats.stockAlerts}`);
        doc.moveDown();

        // Section 2: Tendances
        doc.fontSize(16).text("2. Tendances et Alertes");
        doc.moveDown(0.5);
        doc
          .fontSize(12)
          .text(`Tendance Inscriptions (30j) : ${data.stats.trends.citizens}`)
          .text(
            `Tendance Consultations (24h) : ${data.stats.trends.consultations}`,
          );
        doc.moveDown();

        // Section 3: Heatmap Résumé
        if (data.heatmap && data.heatmap.zones) {
          doc.fontSize(16).text("3. Zones Critiques (Épidémies)");
          doc.moveDown(0.5);
          data.heatmap.zones.forEach((zone: any) => {
            if (zone.severity === "CRITICAL" || zone.severity === "MODERATE") {
              doc
                .fontSize(12)
                .text(
                  `- ${zone.name} : ${zone.cases} cas signalés. Facteurs de risque: ${zone.diseases.join(", ")}`,
                );
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
      } catch (error) {
        reject(error);
      }
    });
  }
}
