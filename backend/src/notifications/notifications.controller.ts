import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  Query,
  Request,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { NotificationsService } from "./notifications.service";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";
import { UserRole } from "../users/entities/user.entity";

@Controller("notifications")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(
  UserRole.ADMIN,
  UserRole.DOCTOR,
  UserRole.PHARMACIST,
  UserRole.PARENT,
  UserRole.PATIENT,
)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async listNotifications(
    @Request() req: any,
    @Query("limit") limit: number = 10,
    @Query("unreadOnly") unreadOnly: boolean = false,
  ) {
    return this.notificationsService.listNotifications(
      req.user.userId,
      limit,
      unreadOnly,
    );
  }

  @Post(":id/read")
  async markAsRead(@Param("id") id: string, @Request() req: any) {
    return this.notificationsService.markAsRead(id, req.user.userId);
  }

  @Post("read-all")
  async markAllAsRead(@Request() req: any) {
    return this.notificationsService.markAllAsRead(req.user.userId);
  }
}
