import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  Param,
  ForbiddenException,
} from "@nestjs/common";
import { VaccinationService } from "./vaccination.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";
import { UserRole } from "../users/entities/user.entity";
import { UsersService } from "../users/users.service";

@Controller("vaccination")
@UseGuards(JwtAuthGuard, RolesGuard)
export class VaccinationController {
  constructor(
    private readonly vaccinationService: VaccinationService,
    private readonly usersService: UsersService,
  ) {}

  @Get("child/:id")
  @Roles(UserRole.PARENT, UserRole.PATIENT, UserRole.DOCTOR, UserRole.ADMIN)
  async getRecords(@Param("id") id: string, @Request() req: any) {
    if (req.user.role === UserRole.PATIENT && req.user.userId !== id) {
      throw new ForbiddenException("Accès interdit à ce carnet vaccinal");
    }
    if (req.user.role === UserRole.PARENT) {
      const isOwnedChild = await this.usersService.isChildOfParent(
        req.user.userId,
        id,
      );
      if (!isOwnedChild) {
        throw new ForbiddenException(
          "Cet enfant n'est pas lié à votre compte parent",
        );
      }
    }
    return this.vaccinationService.findByPatient(id);
  }

  @Post("record")
  @Roles(UserRole.DOCTOR, UserRole.ADMIN)
  async addRecord(@Body() body: any) {
    return this.vaccinationService.create(body);
  }

  @Get("schedule/:patientId")
  @Roles(UserRole.PATIENT, UserRole.PARENT, UserRole.DOCTOR, UserRole.ADMIN)
  async getSchedule(@Param("patientId") patientId: string) {
    return this.vaccinationService.getSchedule(patientId);
  }

  @Get("reminders")
  @Roles(UserRole.ADMIN, UserRole.DOCTOR)
  async getUpcomingReminders() {
    return this.vaccinationService.findUpcomingReminders(48);
  }
}
