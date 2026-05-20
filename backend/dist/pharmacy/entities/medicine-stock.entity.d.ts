import { Pharmacy } from "./pharmacy.entity";
export declare class MedicineStock {
    id: string;
    pharmacy: Pharmacy;
    medicineName: string;
    quantity: number;
    thresholdAlert: number;
    expiryDate: Date;
    createdAt: Date;
}
