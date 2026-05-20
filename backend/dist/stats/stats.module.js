"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const stats_controller_1 = require("./stats.controller");
const stats_service_1 = require("./stats.service");
const user_entity_1 = require("../users/entities/user.entity");
const consultation_entity_1 = require("../medical/entities/consultation.entity");
const vaccination_record_entity_1 = require("../vaccination/entities/vaccination-record.entity");
const medicine_stock_entity_1 = require("../pharmacy/entities/medicine-stock.entity");
const epidemic_report_entity_1 = require("../medical/entities/epidemic-report.entity");
const pdf_report_service_1 = require("./pdf-report.service");
let StatsModule = class StatsModule {
};
exports.StatsModule = StatsModule;
exports.StatsModule = StatsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                user_entity_1.User,
                consultation_entity_1.Consultation,
                vaccination_record_entity_1.VaccinationRecord,
                medicine_stock_entity_1.MedicineStock,
                epidemic_report_entity_1.EpidemicReport,
            ]),
        ],
        controllers: [stats_controller_1.StatsController],
        providers: [stats_service_1.StatsService, pdf_report_service_1.PdfReportService],
        exports: [stats_service_1.StatsService],
    })
], StatsModule);
//# sourceMappingURL=stats.module.js.map