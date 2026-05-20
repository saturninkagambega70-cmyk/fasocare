import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class VideoService {
  constructor(private configService: ConfigService) {}

  async generateToken(identity: string, roomName: string) {
    const apiKey = this.configService.get<string>("TWILIO_API_KEY") || "";
    const apiSecret = this.configService.get<string>("TWILIO_API_SECRET") || "";

    // Simulate Twilio Token generation
    if (!apiKey || !apiSecret) {
      throw new Error("TWILIO_API_KEY and TWILIO_API_SECRET are required");
    }
    console.log(`Generating Twilio Token for ${identity} in room ${roomName}`);

    return {
      token: `TWILIO-TOKEN-${identity}-${roomName}-${Date.now()}`,
      room: roomName,
    };
  }
}
