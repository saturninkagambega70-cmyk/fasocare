import { User } from "../../users/entities/user.entity";
export declare enum AppointmentStatus {
    PENDING = "PENDING",
    CONFIRMED = "CONFIRMED",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED"
}
export declare class Appointment {
    id: string;
    patient: User;
    doctor: User;
    date: string;
    time: string;
    reason: string;
    notes: string;
    facility: string;
    status: AppointmentStatus;
    cancelledAt: Date;
    completedAt: Date;
    createdAt: Date;
}
