import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Appointment } from "./entities/appointment.entity";
import { AppointmentService } from "./appointment.service";
import { AppointmentController } from "./appointment.controller";
import { Notification } from "../medical/entities/notification.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Appointment, Notification])],
  controllers: [AppointmentController],
  providers: [AppointmentService],
  exports: [AppointmentService],
})
export class AppointmentModule {}
