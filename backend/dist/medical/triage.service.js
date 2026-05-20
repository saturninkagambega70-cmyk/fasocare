"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TriageService = void 0;
const common_1 = require("@nestjs/common");
let TriageService = class TriageService {
    async analyzeSymptoms(symptoms) {
        const text = symptoms.toLowerCase();
        const vitalDanger = {
            keywords: [
                "inconscient",
                "coma",
                "convulsion",
                "ne respire plus",
                "étouffement",
                "hémorragie",
                "sang abondant",
                "poitrine serrée",
            ],
            score: 15,
            urgency: "CRITICAL",
        };
        const tropicalSevere = {
            keywords: [
                "forte fièvre",
                "raideur nucale",
                "yeux jaunes",
                "vomissements sang",
                "déshydratation sévère",
            ],
            score: 8,
            urgency: "CRITICAL",
        };
        const moderate = {
            keywords: [
                "fièvre",
                "maux de tête",
                "diarrhée",
                "douleurs abdominales",
                "courbatures",
                "toux grasse",
            ],
            score: 4,
            urgency: "MODERATE",
        };
        let totalScore = 0;
        let maxUrgency = "LOW";
        [vitalDanger, tropicalSevere, moderate].forEach((category) => {
            category.keywords.forEach((word) => {
                if (text.includes(word)) {
                    totalScore += category.score;
                    if (category.score > 7)
                        maxUrgency = "CRITICAL";
                    else if (category.score > 3 && maxUrgency !== "CRITICAL")
                        maxUrgency = "MODERATE";
                }
            });
        });
        const possibleDiagnoses = [];
        if (text.includes("fièvre")) {
            if (text.includes("tête") || text.includes("courbatures"))
                possibleDiagnoses.push("Suspicion de Paludisme / Dengue");
            if (text.includes("nucale") || text.includes("cou"))
                possibleDiagnoses.push("Alerte Méningite");
        }
        if (text.includes("diarrhée") || text.includes("vomissement")) {
            possibleDiagnoses.push("Infection Gastro-intestinale");
        }
        if (maxUrgency === "CRITICAL" || totalScore >= 12) {
            return {
                urgency: "CRITICAL",
                possibleDiagnoses: possibleDiagnoses.length
                    ? possibleDiagnoses
                    : ["Urgence Vitale potentielle"],
                recommendation: "ALERTE CRITIQUE : Rendez-vous immédiatement aux urgences. Utilisez le bouton SOS de l'application pour une assistance immédiate.",
            };
        }
        else if (maxUrgency === "MODERATE" || totalScore >= 4) {
            return {
                urgency: "MODERATE",
                possibleDiagnoses: possibleDiagnoses.length
                    ? possibleDiagnoses
                    : ["Infection ou affection modérée"],
                recommendation: "CONSULTATION NÉCESSAIRE : Veuillez consulter un médecin dans les 24 heures. Hydratez-vous et surveillez la température.",
            };
        }
        return {
            urgency: "LOW",
            possibleDiagnoses: ["Symptômes mineurs"],
            recommendation: "SOINS À DOMICILE : Reposez-vous. Si les symptômes s'aggravent ou persistent plus de 48h, consultez un professionnel de santé.",
        };
    }
};
exports.TriageService = TriageService;
exports.TriageService = TriageService = __decorate([
    (0, common_1.Injectable)()
], TriageService);
//# sourceMappingURL=triage.service.js.map