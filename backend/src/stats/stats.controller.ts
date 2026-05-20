import { Controller, Get, UseGuards, Res } from "@nestjs/common";
import { Response } from "express";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { StatsService } from "./stats.service";
import { PdfReportService } from "./pdf-report.service";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";
import { UserRole } from "../users/entities/user.entity";

@Controller("stats")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.HEALTH_MINISTRY, UserRole.INSPECTOR)
export class StatsController {
  constructor(
    private readonly statsService: StatsService,
    private readonly pdfReportService: PdfReportService,
  ) {}

  @Get("dashboard")
  async getDashboardStats() {
    return this.statsService.getDashboardStats();
  }

  @Get("citizens")
  async getCitizenCount() {
    return this.statsService.getCitizenCount();
  }

  @Get("vaccination")
  async getVaccinationRate() {
    return this.statsService.getVaccinationRate();
  }

  @Get("consultations")
  async getConsultationCount() {
    return this.statsService.getConsultationCount();
  }

  @Get("stock-alerts")
  async getStockAlerts() {
    return this.statsService.getStockAlerts();
  }

  @Get("map")
  async getMapData() {
    return this.statsService.getMapData();
  }

  @Get("heatmap")
  async getEpidemicHeatmap() {
    return this.statsService.getEpidemicHeatmap();
  }

  @Get("export")
  @Roles(UserRole.ADMIN, UserRole.HEALTH_MINISTRY, UserRole.INSPECTOR)
  async exportReports(@Res() res: Response) {
    const csv = await this.statsService.exportReports();
    res.header("Content-Type", "text/csv");
    res.header(
      "Content-Disposition",
      "attachment; filename=rapport_fasocare.csv",
    );
    return res.send(csv);
  }

  @Get("export-pdf")
  @Roles(UserRole.ADMIN, UserRole.HEALTH_MINISTRY, UserRole.INSPECTOR)
  async exportPdf(@Res() res: Response) {
    const dashboardStats = await this.statsService.getDashboardStats();
    const heatmap = await this.statsService.getEpidemicHeatmap();
    const pdfBuffer = await this.pdfReportService.generateWeeklyReport({
      stats: dashboardStats.data,
      heatmap: heatmap.data,
    });

    res.header("Content-Type", "application/pdf");
    res.header(
      "Content-Disposition",
      "attachment; filename=rapport_national_fasocare.pdf",
    );
    res.header("Content-Length", pdfBuffer.length.toString());
    return res.send(pdfBuffer);
  }
}
