import { Consultation } from "./consultation.entity";
export declare enum ItemStatus {
    PENDING = "PENDING",
    DISPENSED = "DISPENSED",
    UNAVAILABLE = "UNAVAILABLE"
}
export declare class PrescriptionItem {
    id: string;
    consultation: Consultation;
    medicineName: string;
    dosage: string;
    quantity: number;
    timeOfDay: string;
    status: string;
    createdAt: Date;
}
