import { AppConfigService } from "../config/app-config.service";
export interface TriageInput {
    symptoms: string[];
    age?: number;
    gender?: string;
    duration?: string;
    severity?: "mild" | "moderate" | "severe";
}
export interface TriageResult {
    priority: "low" | "medium" | "high" | "emergency";
    recommendation: string;
    nextSteps: string[];
    urgencyLevel: number;
    isOfflineFallback: boolean;
    modelUsed?: string;
}
export declare class AiService {
    private config;
    private readonly logger;
    private ollamaEndpoint;
    private modelName;
    private isOfflineMode;
    constructor(config: AppConfigService);
    triagePatient(input: TriageInput): Promise<TriageResult>;
    private triageWithAI;
    private triageOffline;
    private buildTriagePrompt;
    generateResponse(prompt: string): Promise<string>;
    private generateOfflineResponse;
}
