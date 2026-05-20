import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Between, LessThan } from "typeorm";
import PDFDocument from "pdfkit";
import { Consultation } from "../medical/entities/consultation.entity";
import { VaccinationRecord } from "../vaccination/entities/vaccination-record.entity";
import { MedicineStock } from "../pharmacy/entities/medicine-stock.entity";

@Injectable()
export class ReportingService {
  constructor(
    @InjectRepository(Consultation)
    private consultationRepo: Repository<Consultation>,
    @InjectRepository(VaccinationRecord)
    private vaccinationRepo: Repository<VaccinationRecord>,
    @InjectRepository(MedicineStock)
    private stockRepo: Repository<MedicineStock>,
  ) {}

  async generateWeeklySummary(): Promise<Buffer> {
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);

    const consultations = await this.consultationRepo.count({
      where: { createdAt: Between(lastWeek, new Date()) },
    });

    const vaccinations = await this.vaccinationRepo.count({
      where: { dateAdministered: Between(lastWeek, new Date()) },
    });

    return new Promise((resolve) => {
      const doc = new PDFDocument({ margin: 50, size: "A4" });
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

  async generateStockAudit(): Promise<Buffer> {
    const lowStock = await this.stockRepo.find({
      where: { quantity: LessThan(10) },
      relations: ["pharmacy"],
    });

    return new Promise((resolve) => {
      const doc = new PDFDocument({ margin: 50, size: "A4" });
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
      } else {
        lowStock.forEach((item) => {
          doc
            .font("Helvetica-Bold")
            .text(`${item.medicineName}`, { continued: true });
          doc
            .font("Helvetica")
            .text(
              ` : ${item.quantity} unités (Pharmacie: ${item.pharmacy?.name || "Inconnue"})`,
            );
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

  private addHeader(doc: any, title: string) {
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
}
