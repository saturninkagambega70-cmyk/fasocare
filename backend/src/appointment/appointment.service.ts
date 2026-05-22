import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Appointment, AppointmentStatus } from "./entities/appointment.entity";
import { Notification, NotificationType } from "../medical/entities/notification.entity";

@Injectable()
export class AppointmentService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
  ) {}

  async create(data: Partial<Appointment>): Promise<Appointment> {
    const appointment = this.appointmentRepository.create(data);
    const saved = await this.appointmentRepository.save(appointment);

    const doctorId = data.doctor?.id || saved.doctor?.id;
    if (doctorId) {
      await this.notificationRepository.save(
        this.notificationRepository.create({
          user: { id: doctorId as any },
          title: "Nouveau rendez-vous",
          content: "Un patient a pris rendez-vous avec vous.",
          type: NotificationType.SYSTEM,
          metadata: { appointmentId: saved.id },
        }),
      ).catch(() => {});
    }

    return saved;
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
    const saved = await this.appointmentRepository.save(appointment);

    const patientId = appointment.patient?.id;
    if (patientId) {
      await this.notificationRepository.save(
        this.notificationRepository.create({
          user: { id: patientId },
          title: "Rendez-vous confirmé",
          content: "Votre rendez-vous a été confirmé par le médecin.",
          type: NotificationType.SYSTEM,
          metadata: { appointmentId: saved.id },
        }),
      ).catch(() => {});
    }

    return saved;
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
    const saved = await this.appointmentRepository.save(appointment);

    const otherUserId = appointment.doctor?.id === userId
      ? appointment.patient?.id
      : appointment.doctor?.id;
    if (otherUserId) {
      await this.notificationRepository.save(
        this.notificationRepository.create({
          user: { id: otherUserId },
          title: "Rendez-vous annulé",
          content: "Le rendez-vous a été annulé.",
          type: NotificationType.SYSTEM,
          metadata: { appointmentId: saved.id },
        }),
      ).catch(() => {});
    }

    return saved;
  }
}
