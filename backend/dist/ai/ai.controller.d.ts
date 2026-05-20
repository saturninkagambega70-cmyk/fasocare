import { AiService, TriageInput } from "./ai.service";
export declare class AiController {
    private readonly aiService;
    constructor(aiService: AiService);
    triage(input: TriageInput): Promise<any>;
    chat(prompt: string): Promise<{
        response: string;
    }>;
    health(): {
        status: string;
        service: string;
    };
}
