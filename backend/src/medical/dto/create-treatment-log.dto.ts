import { TreatmentLogStatus } from "../entities/treatment-log.entity";

export class CreateTreatmentLogDto {
  consultationId: string;
  itemId: string;
  scheduledTime: string;
  status?: TreatmentLogStatus;
}

export class UpdateTreatmentLogStatusDto {
  status: TreatmentLogStatus.TAKEN | TreatmentLogStatus.SKIPPED;
}
