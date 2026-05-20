import { User } from "../../users/entities/user.entity";
import { PrescriptionItem } from "./prescription-item.entity";
export declare class Consultation {
    id: string;
    patient: User;
    doctor: User;
    diagnosis: string;
    treatmentPlan: string;
    temperature: number;
    weight: number;
    pulse: number;
    bloodPressure: string;
    urgencyLevel: string;
    hospital: string;
    prescription: any;
    isDispensed: boolean;
    dispensedAt: Date;
    qr_token: string;
    qr_expiry: Date;
    items: PrescriptionItem[];
    createdAt: Date;
}
