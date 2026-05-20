import { TreatmentLogStatus } from "../entities/treatment-log.entity";
export declare class CreateTreatmentLogDto {
    consultationId: string;
    itemId: string;
    scheduledTime: string;
    status?: TreatmentLogStatus;
}
export declare class UpdateTreatmentLogStatusDto {
    status: TreatmentLogStatus.TAKEN | TreatmentLogStatus.SKIPPED;
}
