import { LaboratoryService } from "./laboratory.service";
export declare class LaboratoryController {
    private readonly laboratoryService;
    constructor(laboratoryService: LaboratoryService);
    getCatalog(): {
        name: string;
        category: string;
        refMin: number;
        refMax: number;
        unit: string;
    }[];
    create(createDto: any): Promise<import("./entities/lab-test.entity").LabTest>;
    findAll(): Promise<import("./entities/lab-test.entity").LabTest[]>;
    findByPatient(patientId: string, req: any): Promise<import("./entities/lab-test.entity").LabTest[]>;
    findOne(id: string, req: any): Promise<import("./entities/lab-test.entity").LabTest>;
    updateResult(id: string, resultData: any): Promise<import("./entities/lab-test.entity").LabTest>;
}
