export interface TriageResult {
    urgency: "LOW" | "MODERATE" | "CRITICAL";
    possibleDiagnoses: string[];
    recommendation: string;
}
export declare class TriageService {
    analyzeSymptoms(symptoms: string): Promise<TriageResult>;
}
