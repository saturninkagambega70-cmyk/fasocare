import {
  Injectable,
  NotFoundException,
  ConflictException,
  GoneException,
  ForbiddenException,
  Inject,
  forwardRef,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Consultation } from "./entities/consultation.entity";
import {
  PrescriptionItem,
  ItemStatus,
} from "./entities/prescription-item.entity";
import { EpidemicReport } from "./entities/epidemic-report.entity";
import { Message } from "./entities/message.entity";
import { Notification, NotificationType } from "./entities/notification.entity";
import { Emergency } from "./entities/emergency.entity";
import { TreatmentLog, TreatmentLogStatus } from "./entities/treatment-log.entity";
import { QrService } from "./qr.service";
import { PharmacyService } from "../pharmacy/pharmacy.service";
import { UsersService } from "../users/users.service";

@Injectable()
export class MedicalService {
  constructor(
    @InjectRepository(Consultation)
    private consultationRepository: Repository<Consultation>,
    @InjectRepository(PrescriptionItem)
    private itemRepository: Repository<PrescriptionItem>,
    @InjectRepository(EpidemicReport)
    private epidemicReportRepository: Repository<EpidemicReport>,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    @InjectRepository(Emergency)
    private emergencyRepository: Repository<Emergency>,
    @InjectRepository(TreatmentLog)
    private treatmentLogRepository: Repository<TreatmentLog>,
    private readonly qrService: QrService,
    @Inject(forwardRef(() => PharmacyService))
    private pharmacyService: PharmacyService,
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
  ) {}

  async findAllByPatient(patientId: string): Promise<Consultation[]> {
    return this.consultationRepository.find({
      where: { patient: { id: patientId } },
      relations: ["doctor", "items"],
      order: { createdAt: "DESC" },
    });
  }

  async findAllByDoctor(doctorId: string): Promise<Consultation[]> {
    return this.consultationRepository.find({
      where: { doctor: { id: doctorId } },
      relations: ["patient", "items"],
      order: { createdAt: "DESC" },
    });
  }

  async findOne(id: string): Promise<Consultation> {
    const consultation = await this.consultationRepository.findOne({
      where: { id },
      relations: ["patient", "doctor", "items"],
    });
    if (!consultation) throw new NotFoundException("Consultation non trouvée");
    return consultation;
  }

  async create(consultationData: Partial<Consultation>): Promise<Consultation> {
    const consultation = this.consultationRepository.create(consultationData);

    // Process prescription if present before saving to avoid double save
    if (consultation.prescription) {
      // Temporarily save to get ID if needed, but we can also use a generated UUID
      // Let's stick to saving once at the end if possible, or handle the ID generation
      // Actually, QR token needs the ID.
    }

    const savedConsultation =
      await this.consultationRepository.save(consultation);

    // --- Automated Epidemic Reporting ---
    if (savedConsultation.diagnosis) {
      // Fire and forget but with error handling, or await.
      // In this context, awaiting is safer to ensure consistency.
      await this.detectAndReportEpidemic(savedConsultation);
    }

    if (savedConsultation.prescription && !savedConsultation.qr_token) {
      // Serialize prescription content for cryptographic hash embedding
      const prescriptionText =
        typeof savedConsultation.prescription === "string"
          ? savedConsultation.prescription
          : JSON.stringify(savedConsultation.prescription);

      const doctorId =
        consultationData.doctor?.id || savedConsultation.doctor?.id;
      savedConsultation.qr_token = this.qrService.generatePrescriptionToken(
        savedConsultation.id,
        prescriptionText,
        doctorId,
      );
      // Persist expiry (24h)
      savedConsultation.qr_expiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const result = await this.consultationRepository.save(savedConsultation);

      const patientId = consultationData.patient?.id || savedConsultation.patient?.id;
      if (patientId) {
        await this.createNotification(
          patientId,
          "Nouvelle ordonnance",
          "Vous avez reçu une nouvelle ordonnance. Présentez votre code QR à la pharmacie.",
          NotificationType.PRESCRIPTION,
          { consultationId: result.id, qrToken: result.qr_token },
        ).catch(() => {});
      }

      return result;
    }

    return savedConsultation;
  }

  /**
   * Analyse le diagnostic pour détecter des maladies à potentiel épidémique
   * et génère automatiquement un rapport pour la carte sanitaire.
   */
  private async detectAndReportEpidemic(consultation: Consultation) {
    if (!consultation.diagnosis) return;

    const diagnosis = consultation.diagnosis.toLowerCase();

    // Liste des maladies surveillées (Burkina Faso context)
    const epidemicDiseases = [
      { name: "Paludisme", keywords: ["palu", "malaria", "plasmodium"] },
      { name: "Dengue", keywords: ["dengue", "flavivirus"] },
      {
        name: "Méningite",
        keywords: ["méningite", "meningitis", "raideur nucale"],
      },
      { name: "Choléra", keywords: ["choléra", "cholera", "vibrion"] },
      { name: "Rougeole", keywords: ["rougeole", "measles"] },
      { name: "Fièvre Jaune", keywords: ["jaune", "yellow fever"] },
    ];

    for (const disease of epidemicDiseases) {
      if (disease.keywords.some((k) => diagnosis.includes(k))) {
        // Détecté ! Création automatique du rapport
        try {
          // Ensure we have a valid doctor reference (even if just an ID)
          const doctorRef = consultation.doctor?.id
            ? { id: consultation.doctor.id }
            : consultation.doctor;

          await this.epidemicReportRepository.save({
            disease: disease.name,
            casesCount: 1,
            location: consultation.hospital || "Inconnu",
            notes: `Détection automatique via consultation ID ${consultation.id}. Diagnostic: ${consultation.diagnosis}`,
            doctor: doctorRef as any,
            status: "SUBMITTED",
          });
          console.log(
            `[EPIDEMIC AUTO-REPORT] ${disease.name} détecté à ${consultation.hospital || "Inconnu"}`,
          );
        } catch (err) {
          console.error("[EPIDEMIC AUTO-REPORT] Erreur de sauvegarde:", err);
        }
        break; // Un rapport par consultation suffit
      }
    }
  }

  async getQueue(): Promise<Consultation[]> {
    return this.consultationRepository.find({
      relations: ["patient", "doctor"],
      order: { createdAt: "DESC" },
      take: 20,
    });
  }

  async validatePrescription(token: string): Promise<Consultation> {
    const isValid = this.qrService.validateToken(token);
    if (!isValid) throw new NotFoundException("Token QR invalide ou altéré");

    const parts = token.split(".")[0].split("-");
    const type = parts[0];
    if (type !== "RX")
      throw new NotFoundException("Ce n'est pas un token d'ordonnance");

    // Reconstituer l'UUID complet (le token stocke les UUID sans tirets)
    const cleanId = parts[1];
    const id = `${cleanId.substring(0, 8)}-${cleanId.substring(8, 12)}-${cleanId.substring(12, 16)}-${cleanId.substring(16, 20)}-${cleanId.substring(20)}`;

    const consultation = await this.findOne(id);
    if (
      !consultation.qr_expiry ||
      consultation.qr_expiry.getTime() < Date.now()
    ) {
      throw new GoneException("L'ordonnance a expiré (validité 24h)");
    }

    // Verify cryptographic integrity of prescription content
    const prescriptionText =
      typeof consultation.prescription === "string"
        ? consultation.prescription
        : JSON.stringify(consultation.prescription);

    if (
      prescriptionText &&
      !this.qrService.validatePrescriptionIntegrity(token, prescriptionText)
    ) {
      throw new ConflictException(
        "Alerte de sécurité: Le contenu de la prescription a été altéré depuis son émission.",
      );
    }

    return consultation;
  }

  async dispense(
    token: string,
    pharmacistId?: string,
    pharmacyId?: string,
  ): Promise<Consultation> {
    const consultation = await this.validatePrescription(token);

    if (consultation.isDispensed) {
      throw new ConflictException("Cette ordonnance a déjà été délivrée.");
    }

    consultation.isDispensed = true;
    consultation.dispensedAt = new Date();
    const saved = await this.consultationRepository.save(consultation);

    // Record in pharmacy + deduct stock if pharmacy context is provided
    if (pharmacistId) {
      try {
        let pid = pharmacyId;
        if (!pid) {
          const pharmacy =
            await this.pharmacyService.findByPharmacist(pharmacistId);
          if (pharmacy) pid = pharmacy.id;
        }
        if (pid) {
          const prescriptionText =
            typeof consultation.prescription === "string"
              ? consultation.prescription
              : JSON.stringify(consultation.prescription || "");
          await this.pharmacyService.linkPrescription({
            pharmacyId: pid,
            consultationId: consultation.id,
            pharmacistId,
            medicineName: prescriptionText.substring(0, 100),
            quantityDispensed: 1,
          });
          try {
            await this.pharmacyService.deductFromStock(
              pid,
              prescriptionText,
              1,
            );
          } catch {}
        }
      } catch {}
    }

    return saved;
  }

  // ===== Prescription Items (per-item dispense) =====

  async getItemsForConsultation(consultationId: string) {
    const items = await this.itemRepository.find({
      where: { consultation: { id: consultationId } },
      order: { createdAt: "ASC" },
    });
    const dispensations =
      await this.pharmacyService.getDispensationsByConsultation(consultationId);
    return items.map((item) => {
      const disp =
        item.status === "DISPENSED"
          ? dispensations.find(
              (d) =>
                d.medicineName?.toLowerCase() ===
                item.medicineName.toLowerCase(),
            )
          : null;
      return {
        ...item,
        cachet: disp
          ? {
              pharmacyName: disp.pharmacyName,
              pharmacyPhone: disp.pharmacyPhone,
              pharmacistName: disp.pharmacistName,
              pharmacistLicense: disp.pharmacistLicense,
              dispensedAt: disp.dispensedAt,
              cachetToken: disp.cachetToken,
            }
          : null,
      };
    });
  }

  async addPrescriptionItems(
    consultationId: string,
    items: { medicineName: string; dosage?: string; quantity?: number; timeOfDay?: string }[],
  ) {
    const consultation = await this.findOne(consultationId);
    const entities = items.map((item) =>
      this.itemRepository.create({
        consultation,
        medicineName: item.medicineName,
        dosage: item.dosage || null,
        quantity: item.quantity || 1,
        timeOfDay: item.timeOfDay || null,
        status: ItemStatus.PENDING,
      }),
    );
    const savedItems = await this.itemRepository.save(entities);

    // Auto-generate treatment logs for the patient
    const patientId = consultation.patient?.id;
    if (patientId) {
      const scheduleMap: Record<string, string> = {
        "Matin": "08:00",
        "Midi": "12:00",
        "Soir": "20:00",
        "Matin et Soir": "08:00 - 20:00",
        "Matin, Midi et Soir": "08:00 - 12:00 - 20:00",
        "Toutes les 8h": "08:00 - 16:00 - 00:00",
      };
      const logs = savedItems.flatMap((item) => {
        const tod = item.timeOfDay || "Matin";
        const times = (scheduleMap[tod] || "08:00").split(" - ");
        return times.map((time) =>
          this.treatmentLogRepository.create({
            consultation: { id: consultation.id },
            item: { id: item.id },
            patient: { id: patientId },
            scheduledTime: time,
            status: TreatmentLogStatus.TAKEN,
          }),
        );
      });
      await this.treatmentLogRepository.save(logs);
    }

    return savedItems;
  }

  async getItemsWithAvailability(token: string, pharmacyId?: string) {
    const consultation = await this.validatePrescription(token);

    const items = await this.itemRepository.find({
      where: { consultation: { id: consultation.id } },
      order: { createdAt: "ASC" },
    });

    let stockMap: Record<string, number> = {};
    if (pharmacyId) {
      const stocks = await this.pharmacyService.getStock(pharmacyId);
      for (const s of stocks) {
        stockMap[s.medicineName.toLowerCase()] =
          (stockMap[s.medicineName.toLowerCase()] || 0) + s.quantity;
      }
    }

    return {
      consultationId: consultation.id,
      isDispensed: consultation.isDispensed,
      items: items.map((item) => ({
        id: item.id,
        medicineName: item.medicineName,
        dosage: item.dosage,
        quantity: item.quantity,
        status: item.status,
        stockDispo: stockMap[item.medicineName.toLowerCase()] || 0,
        disponible:
          (stockMap[item.medicineName.toLowerCase()] || 0) >= item.quantity,
      })),
    };
  }

  async dispenseItems(
    token: string,
    pharmacistId: string,
    pharmacyId: string | undefined,
    dispensedItems: { id: string; status: "DISPENSED" | "UNAVAILABLE" }[],
  ) {
    const consultation = await this.validatePrescription(token);

    const allItems = await this.itemRepository.find({
      where: { consultation: { id: consultation.id } },
    });

    if (allItems.length === 0) {
      throw new NotFoundException(
        "Cette ordonnance n'a pas d'articles. Utilisez l'ancien flux de dispense.",
      );
    }

    let pid = pharmacyId;
    if (!pid) {
      const pharmacy =
        await this.pharmacyService.findByPharmacist(pharmacistId);
      if (pharmacy) pid = pharmacy.id;
    }

    for (const di of dispensedItems) {
      const item = allItems.find((i) => i.id === di.id);
      if (!item) continue;
      if (item.status !== ItemStatus.PENDING) continue;

      item.status = di.status;
      await this.itemRepository.save(item);

      if (di.status === "DISPENSED" && pid) {
        const pharmUser = await this.usersService.findById(pharmacistId);
        const pharmacy =
          await this.pharmacyService.findByPharmacist(pharmacistId);
        await this.pharmacyService.linkPrescription({
          pharmacyId: pid,
          consultationId: consultation.id,
          pharmacistId,
          medicineName: item.medicineName,
          quantityDispensed: item.quantity,
          pharmacistName: pharmUser?.name || undefined,
          pharmacistLicense: pharmUser?.licenseNumber || undefined,
          pharmacyName: pharmacy?.name || undefined,
          pharmacyPhone: pharmacy?.phone || undefined,
        });
        try {
          await this.pharmacyService.deductFromStock(
            pid,
            item.medicineName,
            item.quantity,
          );
        } catch {}
      }
    }

    const allDone = allItems.every(
      (i) =>
        i.status === ItemStatus.DISPENSED ||
        i.status === ItemStatus.UNAVAILABLE,
    );
    if (allDone) {
      consultation.isDispensed = true;
      consultation.dispensedAt = new Date();
      await this.consultationRepository.save(consultation);
    }

    return this.getItemsWithAvailability(token, pid);
  }

  // --- Treatment Logs / Suivi du Traitement ---

  async createTreatmentLog(
    patientId: string,
    dto: { consultationId: string; itemId: string; scheduledTime: string; status?: TreatmentLogStatus },
  ): Promise<TreatmentLog> {
    const consultation = await this.findOne(dto.consultationId);
    const item = await this.itemRepository.findOne({ where: { id: dto.itemId } });
    if (!item) throw new NotFoundException("Médicament non trouvé");

    const log = this.treatmentLogRepository.create({
      consultation: { id: consultation.id },
      item: { id: item.id },
      patient: { id: patientId },
      scheduledTime: dto.scheduledTime,
      status: dto.status || TreatmentLogStatus.TAKEN,
      takenAt: dto.status === TreatmentLogStatus.SKIPPED ? null : new Date(),
    });
    return this.treatmentLogRepository.save(log);
  }

  async getTreatmentLogsByConsultation(consultationId: string): Promise<TreatmentLog[]> {
    return this.treatmentLogRepository.find({
      where: { consultation: { id: consultationId } },
      relations: ["item", "confirmedBy"],
      order: { scheduledTime: "ASC" },
    });
  }

  async getTreatmentProgress(patientId: string): Promise<any> {
    const logs = await this.treatmentLogRepository.find({
      where: { patient: { id: patientId } },
      relations: ["consultation", "item", "confirmedBy"],
      order: { createdAt: "DESC" },
      take: 100,
    });

    const total = logs.length;
    const taken = logs.filter((l) => l.status === TreatmentLogStatus.TAKEN || l.status === TreatmentLogStatus.CONFIRMED).length;
    const adherenceRate = total > 0 ? Math.round((taken / total) * 100) : 0;

    return {
      logs,
      summary: { total, taken, skipped: total - taken, adherenceRate },
    };
  }

  async updateTreatmentLogStatus(
    logId: string,
    patientId: string,
    status: TreatmentLogStatus.TAKEN | TreatmentLogStatus.SKIPPED,
  ): Promise<TreatmentLog> {
    const log = await this.treatmentLogRepository.findOne({
      where: { id: logId },
      relations: ["patient"],
    });
    if (!log) throw new NotFoundException("Entrée de traitement non trouvée");
    if (log.patient?.id !== patientId) throw new ForbiddenException("Vous ne pouvez modifier que votre propre suivi");

    log.status = status;
    log.takenAt = status === TreatmentLogStatus.SKIPPED ? null : new Date();
    return this.treatmentLogRepository.save(log);
  }

  async generateTreatmentLogsFromPrescription(
    consultationId: string,
    patientId: string,
  ): Promise<TreatmentLog[]> {
    const items = await this.itemRepository.find({
      where: { consultation: { id: consultationId } },
    });
    if (items.length === 0) return [];

    const scheduleMap: Record<string, string> = {
      "Matin": "08:00",
      "Midi": "12:00",
      "Soir": "20:00",
      "Matin et Soir": "08:00 - 20:00",
      "Matin, Midi et Soir": "08:00 - 12:00 - 20:00",
      "Toutes les 8h": "08:00 - 16:00 - 00:00",
    };
    const logs = items.flatMap((item) => {
      const tod = item.timeOfDay || "Matin";
      const times = (scheduleMap[tod] || "08:00").split(" - ");
      return times.map((time) =>
        this.treatmentLogRepository.create({
          consultation: { id: consultationId },
          item: { id: item.id },
          patient: { id: patientId },
          scheduledTime: time,
          status: TreatmentLogStatus.TAKEN,
        }),
      );
    });
    return this.treatmentLogRepository.save(logs);
  }

  // --- Epidemic Reporting ---
  async reportEpidemic(doctor: any, reportData: any): Promise<EpidemicReport> {
    const report = this.epidemicReportRepository.create({
      ...reportData,
      doctor: { id: doctor.userId },
    });
    return this.epidemicReportRepository.save(report) as any;
  }

  async getEpidemicReports(doctorId?: string): Promise<EpidemicReport[]> {
    return this.epidemicReportRepository.find({
      where: doctorId ? { doctor: { id: doctorId } } : {},
      relations: ["doctor"],
      order: { createdAt: "DESC" },
    });
  }

  // --- Secure Messaging ---
  async sendMessage(
    sender: any,
    receiverId: string,
    content: string,
  ): Promise<Message> {
    const message = this.messageRepository.create({
      sender: { id: sender.userId },
      receiver: { id: receiverId },
      content,
    });
    return this.messageRepository.save(message);
  }

  async getMessages(userId: string): Promise<Message[]> {
    return this.messageRepository.find({
      where: [{ sender: { id: userId } }, { receiver: { id: userId } }],
      relations: ["sender", "receiver"],
      order: { createdAt: "DESC" },
    });
  }

  // --- Notifications ---
  async getNotifications(userId: string): Promise<Notification[]> {
    return this.notificationRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: "DESC" },
      take: 50,
    });
  }

  async markNotificationAsRead(id: string, userId: string): Promise<void> {
    const notification = await this.notificationRepository.findOne({
      where: { id },
      relations: ["user"],
    });
    if (!notification) {
      throw new NotFoundException("Notification introuvable");
    }
    if (notification.user?.id !== userId) {
      throw new ForbiddenException("Accès interdit à cette notification");
    }
    await this.notificationRepository.update(id, { isRead: true });
  }

  async createNotification(
    userId: string,
    title: string,
    content: string,
    type: any,
    metadata?: any,
  ): Promise<Notification> {
    const notification = this.notificationRepository.create({
      user: { id: userId },
      title,
      content,
      type,
      metadata,
    });
    return this.notificationRepository.save(notification);
  }

  // --- Emergency/SOS ---
  async sendEmergency(caller: any, payload: any): Promise<Emergency> {
    const emergency = this.emergencyRepository.create({
      caller: { id: caller.userId },
      description: payload.description || "Appel d'urgence SOS",
      latitude: payload.latitude,
      longitude: payload.longitude,
      address: payload.address,
      priority: payload.priority || "CRITICAL",
      serviceType: payload.serviceType || "MEDICAL",
      status: "PENDING",
    });

    const savedEmergency = await this.emergencyRepository.save(emergency);

    // Create notification for nearby medical facilities
    // TODO: Implement geolocation-based notification system
    console.log(
      `[EMERGENCY] SOS reçu de ${caller.phone} - ${JSON.stringify(payload)}`,
    );

    return savedEmergency;
  }

  async getEmergencies(userId: string): Promise<Emergency[]> {
    return this.emergencyRepository.find({
      where: { caller: { id: userId } },
      relations: ["caller"],
      order: { createdAt: "DESC" },
      take: 50,
    });
  }

  async acknowledgeEmergency(emergencyId: string): Promise<Emergency> {
    const emergency = await this.emergencyRepository.findOne({
      where: { id: emergencyId },
    });
    if (!emergency) {
      throw new NotFoundException("Urgence non trouvée");
    }

    emergency.status = "ACKNOWLEDGED";
    emergency.acknowledgedAt = new Date();
    return this.emergencyRepository.save(emergency);
  }

  async resolveEmergency(
    emergencyId: string,
    notes?: string,
  ): Promise<Emergency> {
    const emergency = await this.emergencyRepository.findOne({
      where: { id: emergencyId },
    });
    if (!emergency) {
      throw new NotFoundException("Urgence non trouvée");
    }

    emergency.status = "RESOLVED";
    emergency.resolvedAt = new Date();
    if (notes) emergency.notes = notes;
    return this.emergencyRepository.save(emergency);
  }
}
