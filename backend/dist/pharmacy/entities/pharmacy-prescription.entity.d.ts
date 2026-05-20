import { Pharmacy } from "./pharmacy.entity";
import { User } from "../../users/entities/user.entity";
export declare class PharmacyPrescription {
    id: string;
    pharmacy: Pharmacy;
    consultationId: string;
    pharmacist: User;
    medicineName: string;
    quantityDispensed: number;
    dispensedAt: Date;
    pharmacyName: string;
    pharmacyPhone: string;
    pharmacistName: string;
    pharmacistLicense: string;
    cachetSignature: string;
    cachetToken: string;
}
