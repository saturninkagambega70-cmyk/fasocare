import { Injectable } from "@nestjs/common";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const AfricasTalkingModule = require("africastalking");
const AfricasTalking = AfricasTalkingModule.default || AfricasTalkingModule;

@Injectable()
export class TelecomService {
  private readonly at;

  constructor() {
    try {
      this.at = AfricasTalking({
        apiKey: process.env.AT_API_KEY || "",
        username: process.env.AT_USERNAME || "",
      });
    } catch (e: any) {
      console.warn(
        "[TelecomService] AfricasTalking init failed (sandbox mode):",
        e.message,
      );
      this.at = null;
    }
  }

  async sendSms(to: string, message: string) {
    console.log(`Sending SMS via Africa's Talking to ${to?.slice(0, 4)}****`);
    try {
      if (!this.at?.SMS) {
        throw new Error("SMS provider not configured");
      }
      const result = await this.at.SMS.send({
        to: [to],
        message,
        from: "FasoCare_BF",
      });
      return result;
    } catch (error) {
      console.error("SMS Gateway Error:", error);
      return { status: "FAILED", error };
    }
  }

  async generateVideoToken(identity: string, room: string) {
    console.log(`Generating video token for room ${room}`);
    // Mock token for demo purposes
    return {
      identity,
      room,
      token: `mock_twilio_token_for_${identity}_${Date.now()}`,
    };
  }
}
