import { Controller, Get, Res, UseGuards } from "@nestjs/common";
import { Response } from "express";
import { ReportingService } from "./reporting.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";
import { UserRole } from "../users/entities/user.entity";

@Controller("reporting")
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportingController {
  constructor(private readonly reportingService: ReportingService) {}

  @Get("weekly-summary")
  @Roles(UserRole.HEALTH_MINISTRY, UserRole.ADMIN)
  async getWeeklySummary(@Res() res: Response) {
    const buffer = await this.reportingService.generateWeeklySummary();

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition":
        "attachment; filename=Rapport_Hebdomadaire_FasoCare.pdf",
      "Content-Length": buffer.length,
    });

    res.end(buffer);
  }

  @Get("stock-audit")
  @Roles(UserRole.HEALTH_MINISTRY, UserRole.ADMIN)
  async getStockAudit(@Res() res: Response) {
    const buffer = await this.reportingService.generateStockAudit();

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=Audit_Stocks_FasoCare.pdf",
      "Content-Length": buffer.length,
    });

    res.end(buffer);
  }
}
