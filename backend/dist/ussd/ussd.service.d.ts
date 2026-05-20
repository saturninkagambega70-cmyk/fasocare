import { VaccinationService } from "../vaccination/vaccination.service";
import { MedicalService } from "../medical/medical.service";
import { UsersService } from "../users/users.service";
import { Repository } from "typeorm";
import { User } from "../users/entities/user.entity";
import { TelecomService } from "../telecom/telecom.service";
import Redis from "ioredis";
export declare class UssdService {
    private vaccinationService;
    private medicalService;
    private usersService;
    private telecomService;
    private usersRepository;
    private readonly redis;
    private fallbackStore;
    constructor(vaccinationService: VaccinationService, medicalService: MedicalService, usersService: UsersService, telecomService: TelecomService, usersRepository: Repository<User>, redis: Redis | null);
    private getSession;
    private setSession;
    private delSession;
    processUssd(phoneNumber: string, text: string, sessionId: string): Promise<string>;
    private getMainMenu;
    private handleHealthMenu;
    private handleAppointmentMenu;
    private handlePharmacyMenu;
    private handleReportMenu;
}
