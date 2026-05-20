import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MetricsService } from "./metrics.service";
import { MetricsController } from "./metrics.controller";
import { AuditService } from "./audit.service";
import { MonitoringController } from "./monitoring.controller";
import { AuditLog } from "../common/audit/entities/audit-log.entity";
import { ConfigModule } from "@nestjs/config";
import { MetricsMiddleware } from "./metrics.middleware";
import { ReportingService } from "./reporting.service";
import { ReportingController } from "./reporting.controller";
import { Consultation } from "../medical/entities/consultation.entity";
import { VaccinationRecord } from "../vaccination/entities/vaccination-record.entity";
import { MedicineStock } from "../pharmacy/entities/medicine-stock.entity";

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([
      AuditLog,
      Consultation,
      VaccinationRecord,
      MedicineStock,
    ]),
  ],
  controllers: [MonitoringController, MetricsController, ReportingController],
  providers: [AuditService, MetricsService, ReportingService],
  exports: [AuditService, MetricsService, ReportingService],
})
export class MonitoringModule {}
