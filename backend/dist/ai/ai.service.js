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
var AiService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiService = void 0;
const common_1 = require("@nestjs/common");
const app_config_service_1 = require("../config/app-config.service");
let AiService = AiService_1 = class AiService {
    constructor(config) {
        this.config = config;
        this.logger = new common_1.Logger(AiService_1.name);
        this.isOfflineMode = false;
        this.ollamaEndpoint = this.config.ollamaEndpoint;
        this.modelName = this.config.ollamaModel;
        this.isOfflineMode = !this.ollamaEndpoint;
    }
    async triagePatient(input) {
        if (this.isOfflineMode || !this.ollamaEndpoint) {
            return this.triageOffline(input);
        }
        try {
            return await this.triageWithAI(input);
        }
        catch (error) {
            this.logger.warn(`AI triage failed, falling back to offline: ${error.message}`);
            return this.triageOffline(input);
        }
    }
    async triageWithAI(input) {
        const prompt = this.buildTriagePrompt(input);
        const response = await fetch(`${this.ollamaEndpoint}/api/generate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model: this.modelName,
                prompt,
                stream: false,
                format: "json",
            }),
        });
        if (!response.ok)
            throw new Error(`Ollama error: ${response.status}`);
        const data = await response.json();
        const parsed = JSON.parse(data.response);
        return {
            priority: parsed.priority || "medium",
            recommendation: parsed.recommendation || "Consultation recommandée",
            nextSteps: parsed.nextSteps || ["Consulter un médecin"],
            urgencyLevel: parsed.urgencyLevel || 5,
            isOfflineFallback: false,
            modelUsed: this.modelName,
        };
    }
    triageOffline(input) {
        const severityScores = {
            severe: 9,
            moderate: 6,
            mild: 3,
        };
        const symptomAlerts = {
            "douleur thoracique": 10,
            essoufflement: 9,
            saignement: 8,
            "fievre haute": 7,
            convulsions: 10,
            "perte conscience": 10,
            allergie: 8,
            fracture: 7,
            vomissement: 5,
            diarrhee: 4,
            toux: 3,
            fatigue: 2,
            "mal de tete": 2,
        };
        let urgencyScore = severityScores[input.severity || "moderate"] || 5;
        for (const symptom of input.symptoms || []) {
            const lower = symptom.toLowerCase();
            for (const [alert, score] of Object.entries(symptomAlerts)) {
                if (lower.includes(alert))
                    urgencyScore = Math.max(urgencyScore, score);
            }
        }
        if (input.age && (input.age < 5 || input.age > 65))
            urgencyScore = Math.min(urgencyScore + 2, 10);
        if (urgencyScore >= 8)
            return {
                priority: "emergency",
                recommendation: "URGENCE - Rendez-vous aux urgences immédiatement",
                nextSteps: [
                    "Appeler le 15",
                    "Se rendre aux urgences",
                    "Ne pas attendre",
                ],
                urgencyLevel: Math.min(urgencyScore, 10),
                isOfflineFallback: true,
            };
        if (urgencyScore >= 6)
            return {
                priority: "high",
                recommendation: "Consultation urgente recommandée dans les 24h",
                nextSteps: [
                    "Consulter un médecin dès aujourd'hui",
                    "Surveiller les symptômes",
                    "Suivre les recommandations",
                ],
                urgencyLevel: Math.min(urgencyScore, 10),
                isOfflineFallback: true,
            };
        if (urgencyScore >= 4)
            return {
                priority: "medium",
                recommendation: "Consultation recommandée dans la semaine",
                nextSteps: [
                    "Prendre RDV avec un médecin",
                    "Surveiller les symptômes",
                    "Revenir si aggravation",
                ],
                urgencyLevel: Math.min(urgencyScore, 10),
                isOfflineFallback: true,
            };
        return {
            priority: "low",
            recommendation: "Surveillance à domicile recommandée",
            nextSteps: ["Repos", "Hydratation", "Consulter si aggravation"],
            urgencyLevel: Math.min(urgencyScore, 10),
            isOfflineFallback: true,
        };
    }
    buildTriagePrompt(input) {
        return `Tu es un assistant médical au Burkina Faso. Analyse les symptômes et fournis un triage.
Patient: ${input.age ? `${input.age} ans` : "âge inconnu"}, ${input.gender || "N/A"}.
Symptômes: ${input.symptoms.join(", ")}. Durée: ${input.duration || "N/A"}. Sévérité: ${input.severity || "N/A"}.
Réponds UNIQUEMENT en JSON: { "priority": "low|medium|high|emergency", "recommendation": "...", "nextSteps": [...], "urgencyLevel": 1-10 }`;
    }
    async generateResponse(prompt) {
        if (this.isOfflineMode || !this.ollamaEndpoint) {
            return this.generateOfflineResponse(prompt);
        }
        try {
            const response = await fetch(`${this.ollamaEndpoint}/api/generate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ model: this.modelName, prompt, stream: false }),
            });
            const data = await response.json();
            return data.response;
        }
        catch (error) {
            this.logger.error(`AI response failed: ${error.message}`);
            return this.generateOfflineResponse(prompt);
        }
    }
    generateOfflineResponse(prompt) {
        const lower = prompt.toLowerCase();
        if (lower.includes("paludisme") ||
            lower.includes("fievre") ||
            lower.includes("fièvre"))
            return `🤒 **Conseils fièvre/paludisme**\n1. Consultez un centre de santé dans les 24h\n2. Paracétamol (max 3g/jour)\n3. Boire beaucoup d'eau\n4. Moustiquaire imprégnée\n⚠️ Fièvre > 39°C → urgences`;
        if (lower.includes("diarrhee") ||
            lower.includes("diarrhée") ||
            lower.includes("vomi"))
            return `🩺 **Conseils diarrhée/vomissements**\n1. SRO en pharmacie\n2. Boire beaucoup d'eau propre\n3. Éviter gras/épicé\n4. Consultez si > 48h ou sang\n⚠️ Enfant → consulter rapidement`;
        if (lower.includes("toux") ||
            lower.includes("rhume") ||
            lower.includes("grippe"))
            return `🤧 **Conseils toux/rhume**\n1. Repos et hydratation\n2. Miel et citron\n3. Paracétamol si fièvre\n4. Consultez si > 7 jours\n⚠️ Difficulté à respirer → urgences`;
        if (lower.includes("mal de tete") ||
            lower.includes("migraine") ||
            lower.includes("tête"))
            return `💆 **Conseils maux de tête**\n1. Repos au calme\n2. Paracétamol\n3. Hydratation\n4. Éviter écrans\n⚠️ Soudain/violent → consulter`;
        if (lower.includes("douleur") ||
            lower.includes("blessure") ||
            lower.includes("plaie"))
            return `🏥 **Conseils blessures**\n1. Nettoyer à l'eau propre\n2. Désinfecter\n3. Pansement propre\n4. Consultez si profond\n⚠️ Douleur thoracique → urgences`;
        if (lower.includes("grossesse") ||
            lower.includes("enceinte") ||
            lower.includes("bebe"))
            return `👶 **Conseils grossesse/nourrisson**\n1. Consultations prénatales au CSPS\n2. Vaccins obligatoires\n3. Allaitement 6 mois\n4. Carnet de santé\n⚠️ Saignement ou fièvre → urgences`;
        return `🩺 **Assistant Santé FasoCare**\n\nDécrivez vos symptômes (fièvre, toux, diarrhée, maux de tête, douleurs...) pour des conseils.\n\n📌 Urgence ? Appelez le **15** ou utilisez SOS.\n📱 Consultez un médecin au CSPS.`;
    }
};
exports.AiService = AiService;
exports.AiService = AiService = AiService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [app_config_service_1.AppConfigService])
], AiService);
//# sourceMappingURL=ai.service.js.map