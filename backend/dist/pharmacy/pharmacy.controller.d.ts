import { PharmacyService } from "./pharmacy.service";
export declare class PharmacyController {
    private readonly pharmacyService;
    constructor(pharmacyService: PharmacyService);
    findAll(): Promise<import("./entities/pharmacy.entity").Pharmacy[]>;
    findAllPublic(): Promise<any[]>;
    findMyPharmacies(req: any): Promise<import("./entities/pharmacy.entity").Pharmacy[]>;
    getStock(id: string, req: any): Promise<import("./entities/medicine-stock.entity").MedicineStock[]>;
    updateStock(stockId: string, quantity: number, req: any): Promise<import("./entities/medicine-stock.entity").MedicineStock>;
    getLowStockAlerts(req: any): Promise<import("./entities/medicine-stock.entity").MedicineStock[]>;
    getStats(req: any): Promise<any>;
    verifyCachet(token: string): Promise<any>;
    create(data: any, req: any): Promise<import("./entities/pharmacy.entity").Pharmacy>;
}
