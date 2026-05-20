import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  Request,
} from "@nestjs/common";
import { AppointmentService } from "./appointment.service";
import { CreateAppointmentDto } from "./dto/create-appointment.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";
import { UserRole } from "../users/entities/user.entity";

@Controller("appointments")
@UseGuards(JwtAuthGuard, RolesGuard)
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @Post()
  @Roles(UserRole.PATIENT, UserRole.PARENT, UserRole.DOCTOR)
  async create(@Body() body: CreateAppointmentDto, @Request() req: any) {
    const appointment = await this.appointmentService.create({
      patient: { id: req.user.userId } as any,
      doctor: { id: body.doctorId } as any,
      date: body.date,
      time: body.time,
      reason: body.reason,
      facility: body.facility,
    });
    return { statusCode: 201, success: true, data: appointment };
  }

  @Get("my-appointments")
  @Roles(UserRole.PATIENT, UserRole.PARENT)
  async getMyAppointments(@Request() req: any) {
    const appointments = await this.appointmentService.findByPatient(
      req.user.userId,
    );
    return { statusCode: 200, success: true, data: appointments };
  }

  @Get("doctor-appointments")
  async getDoctorAppointments(@Request() req: any) {
    const appointments = await this.appointmentService.findByDoctor(
      req.user.userId,
    );
    return { statusCode: 200, success: true, data: appointments };
  }

  @Patch(":id/confirm")
  async confirm(@Param("id") id: string, @Request() req: any) {
    const appointment = await this.appointmentService.confirm(
      id,
      req.user.userId,
    );
    return { statusCode: 200, success: true, data: appointment };
  }

  @Patch(":id/complete")
  async complete(@Param("id") id: string, @Request() req: any) {
    const appointment = await this.appointmentService.complete(
      id,
      req.user.userId,
    );
    return { statusCode: 200, success: true, data: appointment };
  }

  @Patch(":id/cancel")
  @Roles(UserRole.PATIENT, UserRole.DOCTOR, UserRole.PARENT)
  async cancel(@Param("id") id: string, @Request() req: any) {
    const appointment = await this.appointmentService.cancel(
      id,
      req.user.userId,
    );
    return { statusCode: 200, success: true, data: appointment };
  }
}
