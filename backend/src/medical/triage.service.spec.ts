import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { Test, TestingModule } from "@nestjs/testing";
import { TriageService } from "./triage.service";

describe("TriageService", () => {
  let service: TriageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TriageService],
    }).compile();

    service = module.get<TriageService>(TriageService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("analyzeSymptoms", () => {
    it("should detect CRITICAL urgency for vital danger keywords", async () => {
      const result = await service.analyzeSymptoms(
        "Le patient est inconscient et a une hémorragie",
      );
      expect(result.urgency).toBe("CRITICAL");
      expect(result.recommendation).toContain("ALERTE CRITIQUE");
    });

    it("should detect MODERATE urgency for moderate keywords", async () => {
      const result = await service.analyzeSymptoms(
        "J'ai de la fièvre et des maux de tête",
      );
      expect(result.urgency).toBe("MODERATE");
      expect(result.recommendation).toContain("CONSULTATION NÉCESSAIRE");
    });

    it("should detect LOW urgency for minor symptoms", async () => {
      const result = await service.analyzeSymptoms("J'ai un peu mal au doigt");
      expect(result.urgency).toBe("LOW");
      expect(result.recommendation).toContain("SOINS À DOMICILE");
    });

    it("should suggest Malaria/Dengue if fever and headache/muscle pain", async () => {
      const result = await service.analyzeSymptoms(
        "Forte fièvre et courbatures",
      );
      expect(result.possibleDiagnoses).toContain(
        "Suspicion de Paludisme / Dengue",
      );
    });

    it("should suggest Meningitis if fever and stiff neck", async () => {
      const result = await service.analyzeSymptoms("Fièvre et raideur nucale");
      expect(result.possibleDiagnoses).toContain("Alerte Méningite");
    });

    it("should suggest Gastrointestinal infection if diarrhea or vomiting", async () => {
      const result = await service.analyzeSymptoms("J'ai la diarrhée");
      expect(result.possibleDiagnoses).toContain(
        "Infection Gastro-intestinale",
      );
    });
  });
});
