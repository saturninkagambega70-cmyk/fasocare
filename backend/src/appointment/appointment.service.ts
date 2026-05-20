import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Appointment, AppointmentStatus } from "./entities/appointment.entity";

@Injectable()
export class AppointmentService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
  ) {}

  async create(data: Partial<Appointment>): Promise<Appointment> {
    const appointment = this.appointmentRepository.create(data);
    return this.appointmentRepository.save(appointment);
  }

  async findByPatient(patientId: string): Promise<Appointment[]> {
    return this.appointmentRepository.find({
      where: { patient: { id: patientId } },
      relations: ["doctor"],
      order: { date: "DESC" },
    });
  }

  async findByDoctor(doctorId: string): Promise<Appointment[]> {
    return this.appointmentRepository.find({
      where: { doctor: { id: doctorId } },
      relations: ["patient"],
      order: { date: "DESC" },
    });
  }

  async findOne(id: string): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id },
      relations: ["patient", "doctor"],
    });
    if (!appointment) throw new NotFoundException("Rendez-vous non trouvé");
    return appointment;
  }

  async confirm(id: string, doctorId: string): Promise<Appointment> {
    const appointment = await this.findOne(id);
    if (appointment.doctor?.id !== doctorId) {
      throw new ForbiddenException(
        "Vous ne pouvez pas confirmer ce rendez-vous",
      );
    }
    appointment.status = AppointmentStatus.CONFIRMED;
    return this.appointmentRepository.save(appointment);
  }

  async complete(id: string, doctorId: string): Promise<Appointment> {
    const appointment = await this.findOne(id);
    if (appointment.doctor?.id !== doctorId) {
      throw new ForbiddenException(
        "Vous ne pouvez pas compléter ce rendez-vous",
      );
    }
    appointment.status = AppointmentStatus.COMPLETED;
    appointment.completedAt = new Date();
    return this.appointmentRepository.save(appointment);
  }

  async cancel(id: string, userId: string): Promise<Appointment> {
    const appointment = await this.findOne(id);
    if (
      appointment.patient?.id !== userId &&
      appointment.doctor?.id !== userId
    ) {
      throw new ForbiddenException("Vous ne pouvez pas annuler ce rendez-vous");
    }
    appointment.status = AppointmentStatus.CANCELLED;
    appointment.cancelledAt = new Date();
    return this.appointmentRepository.save(appointment);
  }
}
