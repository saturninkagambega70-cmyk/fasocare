import { VaccinationService } from "./vaccination.service";
import { UsersService } from "../users/users.service";
export declare class VaccinationController {
    private readonly vaccinationService;
    private readonly usersService;
    constructor(vaccinationService: VaccinationService, usersService: UsersService);
    getRecords(id: string, req: any): Promise<import("./entities/vaccination-record.entity").VaccinationRecord[]>;
    addRecord(body: any): Promise<import("./entities/vaccination-record.entity").VaccinationRecord>;
    getSchedule(patientId: string): Promise<any[]>;
    getUpcomingReminders(): Promise<import("./entities/vaccination-record.entity").VaccinationRecord[]>;
}
