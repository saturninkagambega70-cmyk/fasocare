import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { StatsController } from "./stats.controller";
import { StatsService } from "./stats.service";
import { User } from "../users/entities/user.entity";
import { Consultation } from "../medical/entities/consultation.entity";
import { VaccinationRecord } from "../vaccination/entities/vaccination-record.entity";
import { MedicineStock } from "../pharmacy/entities/medicine-stock.entity";
import { EpidemicReport } from "../medical/entities/epidemic-report.entity";
import { PdfReportService } from "./pdf-report.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Consultation,
      VaccinationRecord,
      MedicineStock,
      EpidemicReport,
    ]),
  ],
  controllers: [StatsController],
  providers: [StatsService, PdfReportService],
  exports: [StatsService],
})
export class StatsModule {}
