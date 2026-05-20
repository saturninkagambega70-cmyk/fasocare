import { Repository } from "typeorm";
import { Consultation } from "../medical/entities/consultation.entity";
import { VaccinationRecord } from "../vaccination/entities/vaccination-record.entity";
import { MedicineStock } from "../pharmacy/entities/medicine-stock.entity";
export declare class ReportingService {
    private consultationRepo;
    private vaccinationRepo;
    private stockRepo;
    constructor(consultationRepo: Repository<Consultation>, vaccinationRepo: Repository<VaccinationRecord>, stockRepo: Repository<MedicineStock>);
    generateWeeklySummary(): Promise<Buffer>;
    generateStockAudit(): Promise<Buffer>;
    private addHeader;
}
