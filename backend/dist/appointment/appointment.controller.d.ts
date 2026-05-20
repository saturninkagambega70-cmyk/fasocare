import { AppointmentService } from "./appointment.service";
import { CreateAppointmentDto } from "./dto/create-appointment.dto";
export declare class AppointmentController {
    private readonly appointmentService;
    constructor(appointmentService: AppointmentService);
    create(body: CreateAppointmentDto, req: any): Promise<{
        statusCode: number;
        success: boolean;
        data: import("./entities/appointment.entity").Appointment;
    }>;
    getMyAppointments(req: any): Promise<{
        statusCode: number;
        success: boolean;
        data: import("./entities/appointment.entity").Appointment[];
    }>;
    getDoctorAppointments(req: any): Promise<{
        statusCode: number;
        success: boolean;
        data: import("./entities/appointment.entity").Appointment[];
    }>;
    confirm(id: string, req: any): Promise<{
        statusCode: number;
        success: boolean;
        data: import("./entities/appointment.entity").Appointment;
    }>;
    complete(id: string, req: any): Promise<{
        statusCode: number;
        success: boolean;
        data: import("./entities/appointment.entity").Appointment;
    }>;
    cancel(id: string, req: any): Promise<{
        statusCode: number;
        success: boolean;
        data: import("./entities/appointment.entity").Appointment;
    }>;
}
