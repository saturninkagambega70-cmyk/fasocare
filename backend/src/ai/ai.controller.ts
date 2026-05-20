import { Controller, Post, Body, Get } from "@nestjs/common";
import { AiService, TriageInput, TriageResult } from "./ai.service";

@Controller("ai")
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post("triage")
  async triage(@Body() input: TriageInput): Promise<any> {
    const result = await this.aiService.triagePatient(input);
    // Format compatible avec l'app mobile existante
    return {
      urgency:
        result.priority === "emergency"
          ? "CRITICAL"
          : result.priority === "high"
            ? "MODERATE"
            : "LOW",
      priority: result.priority,
      possibleDiagnoses: result.nextSteps,
      recommendation: result.recommendation,
      urgencyLevel: result.urgencyLevel,
      nextSteps: result.nextSteps,
      isOfflineFallback: result.isOfflineFallback,
    };
  }

  @Post("chat")
  async chat(@Body("prompt") prompt: string): Promise<{ response: string }> {
    const response = await this.aiService.generateResponse(prompt);
    return { response };
  }

  @Get("health")
  health() {
    return { status: "ok", service: "AI Triage" };
  }
}
