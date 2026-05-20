"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MonitoringModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const metrics_service_1 = require("./metrics.service");
const metrics_controller_1 = require("./metrics.controller");
const audit_service_1 = require("./audit.service");
const monitoring_controller_1 = require("./monitoring.controller");
const audit_log_entity_1 = require("../common/audit/entities/audit-log.entity");
const config_1 = require("@nestjs/config");
const reporting_service_1 = require("./reporting.service");
const reporting_controller_1 = require("./reporting.controller");
const consultation_entity_1 = require("../medical/entities/consultation.entity");
const vaccination_record_entity_1 = require("../vaccination/entities/vaccination-record.entity");
const medicine_stock_entity_1 = require("../pharmacy/entities/medicine-stock.entity");
let MonitoringModule = class MonitoringModule {
};
exports.MonitoringModule = MonitoringModule;
exports.MonitoringModule = MonitoringModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule,
            typeorm_1.TypeOrmModule.forFeature([
                audit_log_entity_1.AuditLog,
                consultation_entity_1.Consultation,
                vaccination_record_entity_1.VaccinationRecord,
                medicine_stock_entity_1.MedicineStock,
            ]),
        ],
        controllers: [monitoring_controller_1.MonitoringController, metrics_controller_1.MetricsController, reporting_controller_1.ReportingController],
        providers: [audit_service_1.AuditService, metrics_service_1.MetricsService, reporting_service_1.ReportingService],
        exports: [audit_service_1.AuditService, metrics_service_1.MetricsService, reporting_service_1.ReportingService],
    })
], MonitoringModule);
//# sourceMappingURL=monitoring.module.js.map