import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Req,
} from "@nestjs/common";
import { ConsentService } from "./consent.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";

@ApiTags("consent")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("consent")
export class ConsentController {
  constructor(private readonly consentService: ConsentService) {}

  @Post("grant")
  @ApiOperation({ summary: "Grant a specific consent" })
  grantConsent(@Req() req: any, @Body() body: { consentType: string }) {
    const metadata = {
      ip: req.ip,
      userAgent: req.get("user-agent"),
    };
    return this.consentService.grantConsent(
      req.user.userId,
      body.consentType,
      metadata,
    );
  }

  @Post("revoke")
  @ApiOperation({ summary: "Revoke a specific consent" })
  revokeConsent(@Req() req: any, @Body() body: { consentType: string }) {
    return this.consentService.revokeConsent(req.user.userId, body.consentType);
  }

  @Get("my-consents")
  @ApiOperation({ summary: "Get all consents for the current user" })
  getMyConsents(@Req() req: any) {
    return this.consentService.getPatientConsents(req.user.userId);
  }

  @Delete("delete-account")
  @ApiOperation({
    summary: "Request full data deletion (Right to be Forgotten)",
  })
  deleteAccount(@Req() req: any) {
    return this.consentService.requestDataDeletion(req.user.userId);
  }
}
