import { OnModuleInit } from "@nestjs/common";
import { UsersService } from "./users.service";
import { Repository } from "typeorm";
import { Consultation } from "../medical/entities/consultation.entity";
import { VaccinationRecord } from "../vaccination/entities/vaccination-record.entity";
import { Pharmacy } from "../pharmacy/entities/pharmacy.entity";
export declare class SeedService implements OnModuleInit {
    private usersService;
    private consultationRepository;
    private vaccinationRepository;
    private pharmacyRepository;
    constructor(usersService: UsersService, consultationRepository: Repository<Consultation>, vaccinationRepository: Repository<VaccinationRecord>, pharmacyRepository: Repository<Pharmacy>);
    onModuleInit(): Promise<void>;
    private seedUsers;
    private seedDemoData;
    private seedHealthcareFacilities;
}
