import { Consultation } from "./consultation.entity";
import { PrescriptionItem } from "./prescription-item.entity";
import { User } from "../../users/entities/user.entity";
export declare enum TreatmentLogStatus {
    TAKEN = "TAKEN",
    SKIPPED = "SKIPPED",
    CONFIRMED = "CONFIRMED"
}
export declare class TreatmentLog {
    id: string;
    consultation: Consultation;
    item: PrescriptionItem;
    patient: User;
    scheduledTime: string;
    takenAt: Date;
    status: TreatmentLogStatus;
    confirmedBy: User;
    confirmedAt: Date;
    createdAt: Date;
}
