import { Repository } from "typeorm";
import { Appointment } from "./entities/appointment.entity";
export declare class AppointmentService {
    private appointmentRepository;
    constructor(appointmentRepository: Repository<Appointment>);
    create(data: Partial<Appointment>): Promise<Appointment>;
    findByPatient(patientId: string): Promise<Appointment[]>;
    findByDoctor(doctorId: string): Promise<Appointment[]>;
    findOne(id: string): Promise<Appointment>;
    confirm(id: string, doctorId: string): Promise<Appointment>;
    complete(id: string, doctorId: string): Promise<Appointment>;
    cancel(id: string, userId: string): Promise<Appointment>;
}
