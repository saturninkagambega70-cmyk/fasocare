import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { AuditService } from "./audit.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";
import { UserRole } from "../users/entities/user.entity";

@ApiTags("Monitoring")
@Controller("monitoring")
@UseGuards(JwtAuthGuard, RolesGuard)
export class MonitoringController {
  constructor(private readonly auditService: AuditService) {}

  @Get("audit")
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: "List system audit logs" })
  async getAuditLogs(
    @Query("limit") limit?: number,
    @Query("offset") offset?: number,
    @Query("severity") severity?: string,
  ) {
    return this.auditService.findAll(limit, offset, severity);
  }
}
