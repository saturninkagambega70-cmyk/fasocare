import { Controller, Post, Body, UseGuards, Request } from "@nestjs/common";
import { TelecomService } from "./telecom.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

@Controller("telecom")
@UseGuards(JwtAuthGuard)
export class TelecomController {
  constructor(private readonly telecomService: TelecomService) {}

  @Post("video-token")
  async getVideoToken(@Body("room") room: string, @Request() req: any) {
    // req.user contains the decoded JWT data
    return this.telecomService.generateVideoToken(
      req.user.phone || req.user.userId,
      room,
    );
  }
}
