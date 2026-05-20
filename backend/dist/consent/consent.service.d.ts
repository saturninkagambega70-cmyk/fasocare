import { Repository } from "typeorm";
import { Consent } from "./entities/consent.entity";
import { UsersService } from "../users/users.service";
export declare class ConsentService {
    private consentRepository;
    private usersService;
    constructor(consentRepository: Repository<Consent>, usersService: UsersService);
    grantConsent(patientId: string, consentType: string, metadata: any): Promise<Consent>;
    revokeConsent(patientId: string, consentType: string): Promise<Consent>;
    getPatientConsents(patientId: string): Promise<Consent[]>;
    requestDataDeletion(patientId: string): Promise<void>;
}
