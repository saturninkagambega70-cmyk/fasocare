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
Object.defineProperty(exports, "__esModule", { value: true });
const PDFDocument = require('pdfkit');
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
async function generateTestPdf() {
    const outputPath = path.resolve(__dirname, '../../demo_government_report.pdf');
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);
    const data = {
        stats: {
            citizens: 145820,
            vaccinationRate: 82.5,
            consultations: 1450,
            stockAlerts: 8,
            trends: {
                citizens: '+14%',
                consultations: '+8%'
            }
        },
        heatmap: {
            zones: [
                { name: 'Ouagadougou', cases: 154, diseases: ['Dengue', 'Paludisme'], severity: 'CRITICAL' },
                { name: 'Bobo-Dioulasso', cases: 82, diseases: ['Paludisme'], severity: 'MODERATE' },
                { name: 'Kaya', cases: 28, diseases: ['Dengue'], severity: 'MODERATE' },
                { name: 'Fada N\'Gourma', cases: 5, diseases: ['Grippe'], severity: 'LOW' }
            ]
        }
    };
    doc.fontSize(20).text('Gouvernement du Burkina Faso', { align: 'center' });
    doc.fontSize(14).text('Ministère de la Santé et de l\'Hygiène Publique', { align: 'center' });
    doc.moveDown();
    doc.fontSize(18).text('Rapport Épidémiologique et Sanitaire Hebdomadaire', { align: 'center', underline: true });
    doc.moveDown(2);
    doc.fontSize(12).text(`Date d'export : ${new Date().toLocaleDateString('fr-FR')}`, { align: 'right' });
    doc.text(`Identifiant Rapport : RF-2026-${Math.floor(Math.random() * 10000)}`, { align: 'right' });
    doc.moveDown();
    doc.fontSize(16).text('1. Indicateurs Globaux');
    doc.moveDown(0.5);
    doc.fontSize(12)
        .text(`• Citoyens Enregistrés : ${data.stats.citizens.toLocaleString()}`)
        .text(`• Taux de Couverture Vaccinale : ${data.stats.vaccinationRate}%`)
        .text(`• Consultations (Dernières 24h) : ${data.stats.consultations}`)
        .text(`• Alertes de Stocks critiques : ${data.stats.stockAlerts}`);
    doc.moveDown();
    doc.fontSize(16).text('2. Tendances et Alertes');
    doc.moveDown(0.5);
    doc.fontSize(12)
        .text(`• Tendance Inscriptions (30j) : ${data.stats.trends.citizens}`)
        .text(`• Tendance Consultations (24h) : ${data.stats.trends.consultations}`);
    doc.moveDown();
    if (data.heatmap && data.heatmap.zones) {
        doc.fontSize(16).text('3. Zones Critiques (Épidémies)');
        doc.moveDown(0.5);
        data.heatmap.zones.forEach((zone) => {
            if (zone.severity === 'CRITICAL' || zone.severity === 'MODERATE') {
                const color = zone.severity === 'CRITICAL' ? 'red' : 'orange';
                doc.fillColor(color).fontSize(12).text(`- [${zone.severity}] ${zone.name} : ${zone.cases} cas signalés.`, { continued: true });
                doc.fillColor('black').text(` Maladies: ${zone.diseases.join(', ')}`);
            }
        });
    }
    doc.moveDown(3);
    doc.fillColor('grey').fontSize(9).text('Ce document est confidentiel et destiné uniquement aux autorités sanitaires.', { align: 'center' });
    doc.text('Généré automatiquement par le moteur FasoCare v1.0.', { align: 'center' });
    doc.end();
    stream.on('finish', () => {
        console.log(`✅ Rapport Demo généré avec succès dans : ${outputPath}`);
    });
}
generateTestPdf().catch(console.error);
//# sourceMappingURL=test-pdf-render.js.map