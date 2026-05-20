import { Repository } from "typeorm";
import { Pharmacy } from "./entities/pharmacy.entity";
import { MedicineStock } from "./entities/medicine-stock.entity";
import { PharmacyPrescription } from "./entities/pharmacy-prescription.entity";
import { AppConfigService } from "../config/app-config.service";
export declare class PharmacyService {
    private pharmacyRepository;
    private stockRepository;
    private prescriptionRepository;
    private config;
    constructor(pharmacyRepository: Repository<Pharmacy>, stockRepository: Repository<MedicineStock>, prescriptionRepository: Repository<PharmacyPrescription>, config: AppConfigService);
    findAll(): Promise<Pharmacy[]>;
    findAllPublic(): Promise<any[]>;
    private isPharmacyOpen;
    findByAdmin(adminId: string): Promise<Pharmacy[]>;
    private parseCoords;
    getStock(pharmacyId: string, actor?: {
        userId: string;
        role: string;
    }): Promise<MedicineStock[]>;
    updateStock(stockId: string, quantity: number, actor?: {
        userId: string;
        role: string;
    }): Promise<MedicineStock>;
    createPharmacy(data: Partial<Pharmacy>): Promise<Pharmacy>;
    getLowStockAlerts(adminId: string): Promise<MedicineStock[]>;
    getStats(adminId: string): Promise<any>;
    findByPharmacist(pharmacistId: string): Promise<Pharmacy | null>;
    linkPrescription(data: {
        pharmacyId: string;
        consultationId: string;
        pharmacistId: string;
        medicineName?: string;
        quantityDispensed?: number;
        pharmacistName?: string;
        pharmacistLicense?: string;
        pharmacyName?: string;
        pharmacyPhone?: string;
    }): Promise<PharmacyPrescription>;
    getDispensationsByConsultation(consultationId: string): Promise<PharmacyPrescription[]>;
    verifyCachetToken(token: string): Promise<any>;
    deductFromStock(pharmacyId: string, medicineName: string, quantity?: number): Promise<void>;
}
