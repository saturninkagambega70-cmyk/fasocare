import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MedicalService } from "./medical.service";
import { MedicalController } from "./medical.controller";
import { Consultation } from "./entities/consultation.entity";
import { PrescriptionItem } from "./entities/prescription-item.entity";
import { EpidemicReport } from "./entities/epidemic-report.entity";
import { Message } from "./entities/message.entity";
import { Notification } from "./entities/notification.entity";
import { Emergency } from "./entities/emergency.entity";
import { TreatmentLog } from "./entities/treatment-log.entity";
import { QrService } from "./qr.service";
import { VideoService } from "./video.service";
import { TriageService } from "./triage.service";
import { PharmacyModule } from "../pharmacy/pharmacy.module";
import { UsersModule } from "../users/users.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Consultation,
      PrescriptionItem,
      EpidemicReport,
      Message,
      Notification,
      Emergency,
      TreatmentLog,
    ]),
    forwardRef(() => PharmacyModule),
    forwardRef(() => UsersModule),
  ],
  providers: [MedicalService, QrService, VideoService, TriageService],
  controllers: [MedicalController],
  exports: [MedicalService, VideoService, QrService],
})
export class MedicalModule {}
