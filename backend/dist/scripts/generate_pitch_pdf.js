"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pdfkit_1 = __importDefault(require("pdfkit"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
async function generatePitch() {
    const doc = new pdfkit_1.default({ margin: 50, size: "A4" });
    const outputPath = path.join(__dirname, "../../FasoCare_Fiche_Strategique_Gouvernement.pdf");
    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);
    doc
        .font("Helvetica-Bold")
        .fontSize(16)
        .text("RÉPUBLIQUE DU BURKINA FASO", { align: "center" });
    doc
        .font("Helvetica-Oblique")
        .fontSize(10)
        .text("Unité - Progrès - Justice", { align: "center" });
    doc.moveDown(1);
    doc
        .font("Helvetica")
        .fontSize(12)
        .text("MINISTÈRE DE LA SANTÉ ET DE L'HYGIÈNE PUBLIQUE", {
        align: "center",
    });
    doc.fontSize(10).text("Agence Numérique de Santé (ANS)", { align: "center" });
    doc.moveDown(2);
    doc.rect(50, doc.y, 500, 40).fill("#1a4a2e");
    doc
        .fillColor("white")
        .font("Helvetica-Bold")
        .fontSize(18)
        .text("FASOCARE : SOUVERAINETÉ SANITAIRE NUMÉRIQUE", 50, doc.y + 12, {
        align: "center",
    });
    doc.fillColor("black").moveDown(2);
    doc
        .font("Helvetica-Bold")
        .fontSize(14)
        .text("Note de Synthèse Stratégique", { underline: true });
    doc.moveDown(0.5);
    doc
        .font("Helvetica")
        .fontSize(11)
        .text("FasoCare est une plateforme technologique de pointe conçue pour transformer le système de santé du Burkina Faso. " +
        "Alliant intelligence artificielle, résilience hors-ligne et inclusion totale, elle garantit une gestion moderne, " +
        "sécurisée et souveraine du patrimoine sanitaire national.", { align: "justify" });
    doc.moveDown(1.5);
    const pillars = [
        {
            title: "1. SOUVERAINETÉ & SÉCURITÉ",
            desc: "Hébergement national strict. Chiffrement HMAC SHA-256 pour les ordonnances numériques, éliminant la fraude aux médicaments.",
        },
        {
            title: "2. INTELLIGENCE ÉPIDÉMIOLOGIQUE",
            desc: "Heatmap interactive en temps réel. Détection automatique des foyers de Paludisme et Méningite dès le diagnostic clinique.",
        },
        {
            title: "3. RÉSILIENCE & INCLUSION",
            desc: "Technologie Offline-First pour les zones rurales sans internet. Accessibilité USSD sur mobiles classiques pour 100% de la population.",
        },
        {
            title: "4. OPTIMISATION DES COÛTS (ROI)",
            desc: "Réduction massive des pertes de stocks (CAMEG) et digitalisation des audits. Allocation intelligente des ressources de l'État.",
        },
    ];
    pillars.forEach((p) => {
        doc.fillColor("#b91c1c").font("Helvetica-Bold").fontSize(12).text(p.title);
        doc
            .fillColor("black")
            .font("Helvetica")
            .fontSize(11)
            .text(p.desc, { align: "justify" });
        doc.moveDown(1);
    });
    doc.moveDown(1);
    doc
        .font("Helvetica-Bold")
        .fontSize(13)
        .text("Spécifications Techniques de l'Infrastructure", { underline: true });
    doc.moveDown(0.5);
    const tableTop = doc.y;
    const col1 = 50, col2 = 250, col3 = 450;
    doc.fontSize(10).text("Composant", col1, tableTop);
    doc.text("Technologie", col2, tableTop);
    doc.text("Garantie", col3, tableTop);
    doc.moveDown(0.5);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.5);
    const rows = [
        ["Noyau Système", "NestJS / Redis / Postgres", "Scalabilité Nationale"],
        ["Sécurité PII", "Audit Trail / HMAC / AES", "Protection Citoyenne"],
        ["Connectivité", "Offline Sync / USSD / SMS", "Inclusion Rurale"],
        ["Aide Décision", "Scoring Symptomatique IA", "Priorisation Urgences"],
    ];
    doc.font("Helvetica");
    rows.forEach((r) => {
        doc.text(r[0], col1);
        doc.text(r[1], col2, doc.y - 12);
        doc.text(r[2], col3, doc.y - 12);
        doc.moveDown(0.8);
    });
    doc
        .fontSize(8)
        .fillColor("grey")
        .text("Ce document est certifié par l'Agence Numérique de Santé (ANS). © 2026 FasoCare.", 50, 780, { align: "center" });
    doc.end();
    return new Promise((resolve) => {
        stream.on("finish", () => resolve(outputPath));
    });
}
generatePitch().then((path) => console.log(`PDF Generated at: ${path}`));
//# sourceMappingURL=generate_pitch_pdf.js.map