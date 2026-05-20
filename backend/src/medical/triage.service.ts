import { Injectable } from "@nestjs/common";

export interface TriageResult {
  urgency: "LOW" | "MODERATE" | "CRITICAL";
  possibleDiagnoses: string[];
  recommendation: string;
}

@Injectable()
export class TriageService {
  /**
   * Analyse textuelle structurée pour déterminer l'urgence médicale.
   * Utilise un système de pondération par catégories de symptômes.
   */
  async analyzeSymptoms(symptoms: string): Promise<TriageResult> {
    const text = symptoms.toLowerCase();

    // 1. Détection des signes de danger immédiat (Score élevé)
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
      urgency: "CRITICAL" as const,
    };

    // 2. Symptômes de maladies tropicales sévères
    const tropicalSevere = {
      keywords: [
        "forte fièvre",
        "raideur nucale",
        "yeux jaunes",
        "vomissements sang",
        "déshydratation sévère",
      ],
      score: 8,
      urgency: "CRITICAL" as const,
    };

    // 3. Symptômes modérés
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
      urgency: "MODERATE" as const,
    };

    let totalScore = 0;
    let maxUrgency: "LOW" | "MODERATE" | "CRITICAL" = "LOW";

    [vitalDanger, tropicalSevere, moderate].forEach((category) => {
      category.keywords.forEach((word) => {
        if (text.includes(word)) {
          totalScore += category.score;
          if (category.score > 7) maxUrgency = "CRITICAL";
          else if (category.score > 3 && maxUrgency !== "CRITICAL")
            maxUrgency = "MODERATE";
        }
      });
    });

    // Analyse des combinaisons (Clusters)
    const possibleDiagnoses: string[] = [];
    if (text.includes("fièvre")) {
      if (text.includes("tête") || text.includes("courbatures"))
        possibleDiagnoses.push("Suspicion de Paludisme / Dengue");
      if (text.includes("nucale") || text.includes("cou"))
        possibleDiagnoses.push("Alerte Méningite");
    }
    if (text.includes("diarrhée") || text.includes("vomissement")) {
      possibleDiagnoses.push("Infection Gastro-intestinale");
    }

    if (maxUrgency === ("CRITICAL" as string) || totalScore >= 12) {
      return {
        urgency: "CRITICAL",
        possibleDiagnoses: possibleDiagnoses.length
          ? possibleDiagnoses
          : ["Urgence Vitale potentielle"],
        recommendation:
          "ALERTE CRITIQUE : Rendez-vous immédiatement aux urgences. Utilisez le bouton SOS de l'application pour une assistance immédiate.",
      };
    } else if (maxUrgency === ("MODERATE" as string) || totalScore >= 4) {
      return {
        urgency: "MODERATE",
        possibleDiagnoses: possibleDiagnoses.length
          ? possibleDiagnoses
          : ["Infection ou affection modérée"],
        recommendation:
          "CONSULTATION NÉCESSAIRE : Veuillez consulter un médecin dans les 24 heures. Hydratez-vous et surveillez la température.",
      };
    }

    return {
      urgency: "LOW",
      possibleDiagnoses: ["Symptômes mineurs"],
      recommendation:
        "SOINS À DOMICILE : Reposez-vous. Si les symptômes s'aggravent ou persistent plus de 48h, consultez un professionnel de santé.",
    };
  }
}
