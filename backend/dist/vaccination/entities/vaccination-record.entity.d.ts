import { User } from "../../users/entities/user.entity";
export declare class VaccinationRecord {
    id: string;
    patient: User;
    vaccineName: string;
    dateAdministered: Date;
    nextDoseDate: Date;
    batchNumber: string;
    location: string;
    reminderSent: boolean;
    createdAt: Date;
}
