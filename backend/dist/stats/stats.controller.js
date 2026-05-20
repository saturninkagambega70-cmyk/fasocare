"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatsController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const stats_service_1 = require("./stats.service");
const pdf_report_service_1 = require("./pdf-report.service");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const user_entity_1 = require("../users/entities/user.entity");
let StatsController = class StatsController {
    constructor(statsService, pdfReportService) {
        this.statsService = statsService;
        this.pdfReportService = pdfReportService;
    }
    async getDashboardStats() {
        return this.statsService.getDashboardStats();
    }
    async getCitizenCount() {
        return this.statsService.getCitizenCount();
    }
    async getVaccinationRate() {
        return this.statsService.getVaccinationRate();
    }
    async getConsultationCount() {
        return this.statsService.getConsultationCount();
    }
    async getStockAlerts() {
        return this.statsService.getStockAlerts();
    }
    async getMapData() {
        return this.statsService.getMapData();
    }
    async getEpidemicHeatmap() {
        return this.statsService.getEpidemicHeatmap();
    }
    async exportReports(res) {
        const csv = await this.statsService.exportReports();
        res.header("Content-Type", "text/csv");
        res.header("Content-Disposition", "attachment; filename=rapport_fasocare.csv");
        return res.send(csv);
    }
    async exportPdf(res) {
        const dashboardStats = await this.statsService.getDashboardStats();
        const heatmap = await this.statsService.getEpidemicHeatmap();
        const pdfBuffer = await this.pdfReportService.generateWeeklyReport({
            stats: dashboardStats.data,
            heatmap: heatmap.data,
        });
        res.header("Content-Type", "application/pdf");
        res.header("Content-Disposition", "attachment; filename=rapport_national_fasocare.pdf");
        res.header("Content-Length", pdfBuffer.length.toString());
        return res.send(pdfBuffer);
    }
};
exports.StatsController = StatsController;
__decorate([
    (0, common_1.Get)("dashboard"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], StatsController.prototype, "getDashboardStats", null);
__decorate([
    (0, common_1.Get)("citizens"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], StatsController.prototype, "getCitizenCount", null);
__decorate([
    (0, common_1.Get)("vaccination"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], StatsController.prototype, "getVaccinationRate", null);
__decorate([
    (0, common_1.Get)("consultations"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], StatsController.prototype, "getConsultationCount", null);
__decorate([
    (0, common_1.Get)("stock-alerts"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], StatsController.prototype, "getStockAlerts", null);
__decorate([
    (0, common_1.Get)("map"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], StatsController.prototype, "getMapData", null);
__decorate([
    (0, common_1.Get)("heatmap"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], StatsController.prototype, "getEpidemicHeatmap", null);
__decorate([
    (0, common_1.Get)("export"),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.HEALTH_MINISTRY, user_entity_1.UserRole.INSPECTOR),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StatsController.prototype, "exportReports", null);
__decorate([
    (0, common_1.Get)("export-pdf"),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.HEALTH_MINISTRY, user_entity_1.UserRole.INSPECTOR),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StatsController.prototype, "exportPdf", null);
exports.StatsController = StatsController = __decorate([
    (0, common_1.Controller)("stats"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.HEALTH_MINISTRY, user_entity_1.UserRole.INSPECTOR),
    __metadata("design:paramtypes", [stats_service_1.StatsService,
        pdf_report_service_1.PdfReportService])
], StatsController);
//# sourceMappingURL=stats.controller.js.map