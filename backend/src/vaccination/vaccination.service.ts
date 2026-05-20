import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, LessThan, MoreThan, Between } from "typeorm";
import { VaccinationRecord } from "./entities/vaccination-record.entity";

@Injectable()
export class VaccinationService {
  constructor(
    @InjectRepository(VaccinationRecord)
    private vaccinationRepository: Repository<VaccinationRecord>,
  ) {}

  async findByPatient(patientId: string): Promise<VaccinationRecord[]> {
    return this.vaccinationRepository.find({
      where: { patient: { id: patientId } },
      order: { dateAdministered: "DESC" },
    });
  }

  async findLatestForPatient(
    patientId: string,
  ): Promise<VaccinationRecord | null> {
    return this.vaccinationRepository.findOne({
      where: { patient: { id: patientId } },
      order: { dateAdministered: "DESC" },
    });
  }

  async create(record: Partial<VaccinationRecord>): Promise<VaccinationRecord> {
    const newRecord = this.vaccinationRepository.create(record);
    return this.vaccinationRepository.save(newRecord);
  }

  async getSchedule(patientId: string): Promise<any[]> {
    const records = await this.findByPatient(patientId);
    const defaultSchedule = [
      { vaccineName: "BCG (Tuberculose)", dueAge: "0 mois" },
      { vaccineName: "VPO (Polio 0)", dueAge: "0 mois" },
      { vaccineName: "DTC-HepB-Hib (Penta 1)", dueAge: "2 mois" },
      { vaccineName: "VPO (Polio 1)", dueAge: "2 mois" },
      { vaccineName: "DTC-HepB-Hib (Penta 2)", dueAge: "4 mois" },
      { vaccineName: "VPO (Polio 2)", dueAge: "4 mois" },
      { vaccineName: "DTC-HepB-Hib (Penta 3)", dueAge: "6 mois" },
      { vaccineName: "VPO (Polio 3)", dueAge: "6 mois" },
      { vaccineName: "Rougeole", dueAge: "9 mois" },
      { vaccineName: "Fièvre Jaune", dueAge: "9 mois" },
      { vaccineName: "VAR (Rappel Rougeole)", dueAge: "15-18 mois" },
      { vaccineName: "DTC (Rappel 1)", dueAge: "15-18 mois" },
      { vaccineName: "VPO (Rappel)", dueAge: "15-18 mois" },
      { vaccineName: "DTC (Rappel 2)", dueAge: "5-6 ans" },
    ];
    return defaultSchedule.map((v) => ({
      ...v,
      administered: records.some(
        (r) =>
          r.vaccineName
            .toLowerCase()
            .includes(v.vaccineName.split("(")[0].trim().toLowerCase()) ||
          v.vaccineName.toLowerCase().includes(r.vaccineName.toLowerCase()),
      ),
      dateAdministered:
        records.find((r) =>
          r.vaccineName
            .toLowerCase()
            .includes(v.vaccineName.split("(")[0].trim().toLowerCase()),
        )?.dateAdministered || null,
    }));
  }

  async findUpcomingReminders(
    hoursAhead: number = 48,
  ): Promise<VaccinationRecord[]> {
    const now = new Date();
    const windowEnd = new Date(now.getTime() + hoursAhead * 3600000);
    return this.vaccinationRepository.find({
      where: {
        nextDoseDate: Between(now, windowEnd),
      },
      relations: ["patient"],
    });
  }

  async markReminderSent(id: string): Promise<void> {
    await this.vaccinationRepository.update(id, { reminderSent: true });
  }
}
