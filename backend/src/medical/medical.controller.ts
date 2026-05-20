import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  UseGuards,
  Request,
  Param,
  Query,
  ForbiddenException,
} from "@nestjs/common";
import { MedicalService } from "./medical.service";
import { TriageService } from "./triage.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";
import { Public } from "../auth/public.decorator";
import { UserRole } from "../users/entities/user.entity";
import { UsersService } from "../users/users.service";

@Controller("medical")
@UseGuards(JwtAuthGuard, RolesGuard)
export class MedicalController {
  constructor(
    private readonly medicalService: MedicalService,
    private readonly triageService: TriageService,
    private readonly usersService: UsersService,
  ) {}

  // ===== NEW: API-compatible endpoints =====
  @Get("consultations")
  @Roles(UserRole.PATIENT, UserRole.DOCTOR, UserRole.ADMIN)
  async listConsultations(
    @Query("patientId") patientId?: string,
    @Query("doctorId") doctorId?: string,
    @Query("limit") limit: number = 100,
    @Request() req?: any,
  ) {
    let consultations: any[] = [];

    if (patientId) {
      consultations = await this.medicalService.findAllByPatient(patientId);
    } else if (doctorId) {
      consultations = await this.medicalService.findAllByDoctor(doctorId);
    } else {
      consultations = await this.medicalService.getQueue();
    }

    return {
      statusCode: 200,
      success: true,
      data: {
        consultations: consultations.slice(0, limit),
        total: consultations.length,
      },
    };
  }

  @Get("consultations/:id")
  @Roles(UserRole.PATIENT, UserRole.DOCTOR, UserRole.ADMIN)
  async getConsultation(@Param("id") id: string) {
    try {
      const consultation = await this.medicalService.findOne(id);
      return {
        statusCode: 200,
        success: true,
        data: consultation,
      };
    } catch (error: any) {
      return {
        statusCode: 404,
        success: false,
        message: error.message || "Consultation not found",
      };
    }
  }

  @Post("consultations")
  @Roles(UserRole.DOCTOR)
  async createConsultationAPI(@Body() body: any, @Request() req: any) {
    try {
      const consultation = await this.medicalService.create({
        ...body,
        doctor: { id: req.user.userId },
      });
      return {
        statusCode: 201,
        success: true,
        data: consultation,
      };
    } catch (error: any) {
      return {
        statusCode: 400,
        success: false,
        message: error.message,
      };
    }
  }

  @Get("patients/:patientId/history")
  @Roles(UserRole.PATIENT, UserRole.DOCTOR, UserRole.ADMIN, UserRole.PARENT)
  async getPatientHistory(
    @Param("patientId") patientId: string,
    @Request() req: any,
  ) {
    try {
      if (
        req.user.activeRole === UserRole.PARENT ||
        req.user.roles?.includes(UserRole.PARENT)
      ) {
        const isChild = await this.usersService.isChildOfParent(
          req.user.userId,
          patientId,
        );
        if (!isChild)
          throw new ForbiddenException(
            "Vous ne pouvez consulter que les dossiers de vos enfants.",
          );
      }
      const consultations =
        await this.medicalService.findAllByPatient(patientId);
      const enriched = await Promise.all(
        consultations.map(async (c) => ({
          ...c,
          items: await this.medicalService.getItemsForConsultation(c.id),
        })),
      );
      return {
        statusCode: 200,
        success: true,
        data: enriched,
      };
    } catch (error: any) {
      return {
        statusCode: error instanceof ForbiddenException ? 403 : 400,
        success: false,
        message: error.message,
      };
    }
  }

  // ===== EXISTING endpoints =====
  @Get("history")
  @Roles(UserRole.PATIENT, UserRole.DOCTOR)
  async getHistory(@Request() req: any) {
    if (req.user.role === UserRole.DOCTOR) {
      return this.medicalService.findAllByDoctor(req.user.userId);
    }
    const consultations =
      await this.medicalService.findAllByPatient(req.user.userId);
    const enriched = await Promise.all(
      consultations.map(async (c) => ({
        ...c,
        items: await this.medicalService.getItemsForConsultation(c.id),
      })),
    );
    return {
      statusCode: 200,
      success: true,
      data: enriched,
    };
  }

  // Alias for mobile compatibility (patient/me history)
  @Get("consultations/patient/me")
  @Roles(UserRole.PATIENT, UserRole.DOCTOR)
  async getMyConsultations(@Request() req: any) {
    try {
      const consultations = await this.medicalService.findAllByPatient(
        req.user.userId,
      );
      return {
        statusCode: 200,
        success: true,
        data: consultations,
      };
    } catch (error: any) {
      return {
        statusCode: 400,
        success: false,
        message: error.message,
      };
    }
  }

  @Post("consultation")
  @Roles(UserRole.DOCTOR)
  async createConsultation(@Body() body: any, @Request() req: any) {
    const { patientId, ...rest } = body;
    return this.medicalService.create({
      ...rest,
      patient: patientId ? { id: patientId } : undefined,
      doctor: { id: req.user.userId },
    });
  }

  @Get("queue")
  @Roles(UserRole.DOCTOR, UserRole.PHARMACIST)
  async getQueue() {
    return this.medicalService.getQueue();
  }

  @Get("patients/latest")
  @Roles(UserRole.DOCTOR, UserRole.PHARMACIST)
  async getLatestPatients() {
    return this.medicalService.getQueue();
  }

  @Public()
  @Get("validate-prescription/:token")
  async validatePrescription(@Param("token") token: string) {
    return this.medicalService.validatePrescription(token);
  }

  @Post("dispense/:token")
  @Roles(UserRole.PHARMACIST)
  async dispense(
    @Param("token") token: string,
    @Body() body: { pharmacyId?: string } = {},
    @Request() req: any,
  ) {
    return this.medicalService.dispense(
      token,
      req.user.userId,
      body?.pharmacyId,
    );
  }

  @Post("consultations/:id/items")
  @Roles(UserRole.DOCTOR)
  async addPrescriptionItems(
    @Param("id") id: string,
    @Body()
    items: { medicineName: string; dosage?: string; quantity?: number }[],
  ) {
    return this.medicalService.addPrescriptionItems(id, items);
  }

  @Get("consultations/:id/items")
  @Roles(UserRole.PATIENT, UserRole.DOCTOR, UserRole.PARENT)
  async getPrescriptionItems(@Param("id") id: string) {
    return this.medicalService.getItemsForConsultation(id);
  }

  @Get("consultation-items/:token")
  @Roles(UserRole.PHARMACIST, UserRole.PATIENT)
  async getItemsWithAvailability(
    @Param("token") token: string,
    @Query("pharmacyId") pharmacyId?: string,
  ) {
    return this.medicalService.getItemsWithAvailability(token, pharmacyId);
  }

  @Post("dispense-items/:token")
  @Roles(UserRole.PHARMACIST)
  async dispenseItems(
    @Param("token") token: string,
    @Body()
    body: {
      items: { id: string; status: "DISPENSED" | "UNAVAILABLE" }[];
      pharmacyId?: string;
    },
    @Request() req: any,
  ) {
    return this.medicalService.dispenseItems(
      token,
      req.user.userId,
      body?.pharmacyId,
      body.items,
    );
  }

  // --- Epidemic Reporting ---
  @Post("epidemic-report")
  @Roles(UserRole.DOCTOR)
  async reportEpidemic(@Body() body: any, @Request() req: any) {
    return this.medicalService.reportEpidemic(req.user, body);
  }

  @Get("epidemic-reports")
  @Roles(UserRole.DOCTOR, UserRole.ADMIN)
  async getEpidemicReports(@Request() req: any) {
    const doctorId =
      req.user.role === UserRole.DOCTOR ? req.user.userId : undefined;
    return this.medicalService.getEpidemicReports(doctorId);
  }

  // --- Secure Messaging ---
  @Post("messages")
  @Roles(UserRole.DOCTOR, UserRole.PATIENT)
  async sendMessage(
    @Body() body: { receiverId: string; content: string },
    @Request() req: any,
  ) {
    return this.medicalService.sendMessage(
      req.user,
      body.receiverId,
      body.content,
    );
  }

  @Get("messages")
  @Roles(UserRole.DOCTOR, UserRole.PATIENT)
  async getMessages(@Request() req: any) {
    return this.medicalService.getMessages(req.user.userId);
  }

  // --- Notifications ---
  @Get("notifications")
  @Roles(UserRole.DOCTOR, UserRole.PATIENT, UserRole.PHARMACIST)
  async getNotifications(@Request() req: any) {
    return this.medicalService.getNotifications(req.user.userId);
  }

  @Post("notifications/:id/read")
  @Roles(UserRole.DOCTOR, UserRole.PATIENT, UserRole.PHARMACIST)
  async markAsRead(@Param("id") id: string, @Request() req: any) {
    return this.medicalService.markNotificationAsRead(id, req.user.userId);
  }

  // --- Emergency/SOS ---
  @Post("emergency/sos")
  @Roles(UserRole.PATIENT, UserRole.DOCTOR, UserRole.ADMIN)
  async sendEmergency(@Body() body: any, @Request() req: any) {
    try {
      const emergency = await this.medicalService.sendEmergency(req.user, body);
      return {
        statusCode: 201,
        success: true,
        message:
          "Appel d'urgence envoyé. Une équipe d'intervention est en route.",
        data: emergency,
      };
    } catch (error: any) {
      return {
        statusCode: 400,
        success: false,
        message: error.message,
      };
    }
  }

  // Compatibility with mobile app endpoints
  @Post("emergency")
  @Roles(UserRole.PATIENT, UserRole.DOCTOR, UserRole.ADMIN)
  async sendEmergencyCompat(@Body() body: any, @Request() req: any) {
    try {
      const emergency = await this.medicalService.sendEmergency(req.user, body);
      return {
        statusCode: 201,
        success: true,
        message: "Appel d'urgence envoyé.",
        data: emergency,
      };
    } catch (error: any) {
      return {
        statusCode: 400,
        success: false,
        message: error.message,
      };
    }
  }

  @Get("emergency")
  @Roles(UserRole.PATIENT, UserRole.DOCTOR, UserRole.ADMIN)
  async getEmergenciesCompat(@Request() req: any) {
    try {
      const emergencies = await this.medicalService.getEmergencies(
        req.user.userId,
      );
      return {
        statusCode: 200,
        success: true,
        data: emergencies,
      };
    } catch (error: any) {
      return {
        statusCode: 400,
        success: false,
        message: error.message,
      };
    }
  }

  @Get("emergencies")
  @Roles(UserRole.PATIENT, UserRole.DOCTOR, UserRole.ADMIN)
  async getEmergencies(@Request() req: any) {
    try {
      const emergencies = await this.medicalService.getEmergencies(
        req.user.userId,
      );
      return {
        statusCode: 200,
        success: true,
        data: emergencies,
      };
    } catch (error: any) {
      return {
        statusCode: 400,
        success: false,
        message: error.message,
      };
    }
  }

  @Post("emergency/:id/acknowledge")
  @Roles(UserRole.DOCTOR, UserRole.ADMIN)
  async acknowledgeEmergency(@Param("id") id: string) {
    try {
      const emergency = await this.medicalService.acknowledgeEmergency(id);
      return {
        statusCode: 200,
        success: true,
        message: "Urgence acknowledged",
        data: emergency,
      };
    } catch (error: any) {
      return {
        statusCode: 400,
        success: false,
        message: error.message,
      };
    }
  }

  @Post("emergency/:id/resolve")
  @Roles(UserRole.DOCTOR, UserRole.ADMIN)
  async resolveEmergency(
    @Param("id") id: string,
    @Body() body?: { notes?: string },
  ) {
    try {
      const emergency = await this.medicalService.resolveEmergency(
        id,
        body?.notes,
      );
      return {
        statusCode: 200,
        success: true,
        message: "Urgence resolved",
        data: emergency,
      };
    } catch (error: any) {
      return {
        statusCode: 400,
        success: false,
        message: error.message,
      };
    }
  }

  // --- Treatment Logs / Suivi du Traitement ---

  @Post("treatment-logs")
  @Roles(UserRole.PATIENT)
  async logTreatment(
    @Body() body: { consultationId: string; itemId: string; scheduledTime: string; status?: string },
    @Request() req: any,
  ) {
    try {
      const log = await this.medicalService.createTreatmentLog(req.user.userId, body as any);
      return { statusCode: 201, success: true, data: log };
    } catch (error: any) {
      return { statusCode: 400, success: false, message: error.message };
    }
  }

  @Get("treatment-progress")
  @Roles(UserRole.PATIENT, UserRole.DOCTOR, UserRole.PARENT)
  async getMyTreatmentProgress(@Request() req: any) {
    try {
      const progress = await this.medicalService.getTreatmentProgress(req.user.userId);
      return { statusCode: 200, success: true, data: progress };
    } catch (error: any) {
      return { statusCode: 400, success: false, message: error.message };
    }
  }

  @Get("patients/:patientId/treatment-progress")
  @Roles(UserRole.DOCTOR, UserRole.PARENT, UserRole.ADMIN)
  async getPatientTreatmentProgress(
    @Param("patientId") patientId: string,
    @Request() req: any,
  ) {
    try {
      if (req.user.activeRole === UserRole.PARENT) {
        const isChild = await this.usersService.isChildOfParent(req.user.userId, patientId);
        if (!isChild) throw new ForbiddenException("Vous ne pouvez consulter que les traitements de vos enfants.");
      }
      const progress = await this.medicalService.getTreatmentProgress(patientId);
      return { statusCode: 200, success: true, data: progress };
    } catch (error: any) {
      return { statusCode: error instanceof ForbiddenException ? 403 : 400, success: false, message: error.message };
    }
  }

  @Get("consultations/:id/treatment-logs")
  @Roles(UserRole.PATIENT, UserRole.DOCTOR, UserRole.PARENT)
  async getConsultationTreatmentLogs(@Param("id") id: string) {
    try {
      const logs = await this.medicalService.getTreatmentLogsByConsultation(id);
      return { statusCode: 200, success: true, data: logs };
    } catch (error: any) {
      return { statusCode: 400, success: false, message: error.message };
    }
  }

  @Patch("treatment-logs/:id/status")
  @Roles(UserRole.PATIENT)
  async updateTreatmentLogStatus(
    @Param("id") id: string,
    @Body() body: { status: "TAKEN" | "SKIPPED" },
    @Request() req: any,
  ) {
    try {
      const log = await this.medicalService.updateTreatmentLogStatus(id, req.user.userId, body.status as any);
      return { statusCode: 200, success: true, data: log };
    } catch (error: any) {
      return { statusCode: 400, success: false, message: error.message };
    }
  }

  @Post("consultations/:id/generate-treatment-logs")
  @Roles(UserRole.DOCTOR)
  async generateTreatmentLogs(
    @Param("id") id: string,
    @Request() req: any,
  ) {
    try {
      const consultation = await this.medicalService.findOne(id);
      const patientId = consultation.patient?.id;
      if (!patientId) throw new Error("Patient non trouvé pour cette consultation");
      const logs = await this.medicalService.generateTreatmentLogsFromPrescription(id, patientId);
      return { statusCode: 201, success: true, data: logs, message: `${logs.length} entrées de traitement créées` };
    } catch (error: any) {
      return { statusCode: 400, success: false, message: error.message };
    }
  }

  // --- AI Triage ---
  @Post("triage")
  @Roles(UserRole.PATIENT, UserRole.DOCTOR)
  async triage(@Body() body: { symptoms: string }) {
    try {
      const result = await this.triageService.analyzeSymptoms(
        body.symptoms || "",
      );
      return {
        statusCode: 200,
        success: true,
        data: result,
      };
    } catch (error: any) {
      return {
        statusCode: 400,
        success: false,
        message: error.message,
      };
    }
  }
}
