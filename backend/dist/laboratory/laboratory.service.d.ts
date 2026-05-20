import { Repository } from "typeorm";
import { LabTest } from "./entities/lab-test.entity";
export declare class LaboratoryService {
    private labTestRepository;
    constructor(labTestRepository: Repository<LabTest>);
    getCatalog(): {
        name: string;
        category: string;
        refMin: number;
        refMax: number;
        unit: string;
    }[];
    create(createDto: any): Promise<LabTest>;
    findAll(): Promise<LabTest[]>;
    findByPatient(patientId: string): Promise<LabTest[]>;
    findByPatientForRequester(patientId: string, requester: {
        userId: string;
        role: string;
    }): Promise<LabTest[]>;
    updateResult(id: string, resultData: any): Promise<LabTest>;
    findOne(id: string): Promise<LabTest>;
    findOneForRequester(id: string, requester: {
        userId: string;
        role: string;
    }): Promise<LabTest>;
}
