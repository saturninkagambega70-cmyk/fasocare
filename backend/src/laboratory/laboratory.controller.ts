import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  UseGuards,
  Request,
} from "@nestjs/common";
import { LaboratoryService } from "./laboratory.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";
import { UserRole } from "../users/entities/user.entity";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";

@ApiTags("laboratory")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("laboratory")
export class LaboratoryController {
  constructor(private readonly laboratoryService: LaboratoryService) {}

  @Get("catalog")
  @Roles(UserRole.DOCTOR, UserRole.ADMIN)
  @ApiOperation({
    summary: "Get laboratory test catalog with reference ranges",
  })
  getCatalog() {
    return this.laboratoryService.getCatalog();
  }

  @Post()
  @Roles(UserRole.DOCTOR, UserRole.ADMIN)
  @ApiOperation({ summary: "Prescribe a new laboratory test" })
  create(@Body() createDto: any) {
    return this.laboratoryService.create(createDto);
  }

  @Get()
  @Roles(UserRole.DOCTOR, UserRole.ADMIN)
  @ApiOperation({ summary: "Get all laboratory tests" })
  findAll() {
    return this.laboratoryService.findAll();
  }

  @Get("patient/:patientId")
  @Roles(UserRole.DOCTOR, UserRole.ADMIN, UserRole.PATIENT)
  @ApiOperation({ summary: "Get laboratory tests for a specific patient" })
  findByPatient(@Param("patientId") patientId: string, @Request() req: any) {
    return this.laboratoryService.findByPatientForRequester(
      patientId,
      req.user,
    );
  }

  @Get(":id")
  @Roles(UserRole.DOCTOR, UserRole.ADMIN, UserRole.PATIENT)
  @ApiOperation({ summary: "Get detailed laboratory test by ID" })
  findOne(@Param("id") id: string, @Request() req: any) {
    return this.laboratoryService.findOneForRequester(id, req.user);
  }

  @Patch(":id/result")
  @Roles(UserRole.ADMIN) // In a real scenario, this would be UserRole.LAB_TECHNICIAN
  @ApiOperation({ summary: "Submit laboratory test results" })
  updateResult(@Param("id") id: string, @Body() resultData: any) {
    return this.laboratoryService.updateResult(id, resultData);
  }
}
