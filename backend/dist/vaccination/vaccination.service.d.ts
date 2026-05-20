import { Repository } from "typeorm";
import { VaccinationRecord } from "./entities/vaccination-record.entity";
export declare class VaccinationService {
    private vaccinationRepository;
    constructor(vaccinationRepository: Repository<VaccinationRecord>);
    findByPatient(patientId: string): Promise<VaccinationRecord[]>;
    findLatestForPatient(patientId: string): Promise<VaccinationRecord | null>;
    create(record: Partial<VaccinationRecord>): Promise<VaccinationRecord>;
    getSchedule(patientId: string): Promise<any[]>;
    findUpcomingReminders(hoursAhead?: number): Promise<VaccinationRecord[]>;
    markReminderSent(id: string): Promise<void>;
}
