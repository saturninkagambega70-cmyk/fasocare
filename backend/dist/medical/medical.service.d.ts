import { Repository } from "typeorm";
import { Consultation } from "./entities/consultation.entity";
import { PrescriptionItem } from "./entities/prescription-item.entity";
import { EpidemicReport } from "./entities/epidemic-report.entity";
import { Message } from "./entities/message.entity";
import { Notification } from "./entities/notification.entity";
import { Emergency } from "./entities/emergency.entity";
import { TreatmentLog, TreatmentLogStatus } from "./entities/treatment-log.entity";
import { QrService } from "./qr.service";
import { PharmacyService } from "../pharmacy/pharmacy.service";
import { UsersService } from "../users/users.service";
export declare class MedicalService {
    private consultationRepository;
    private itemRepository;
    private epidemicReportRepository;
    private messageRepository;
    private notificationRepository;
    private emergencyRepository;
    private treatmentLogRepository;
    private readonly qrService;
    private pharmacyService;
    private usersService;
    constructor(consultationRepository: Repository<Consultation>, itemRepository: Repository<PrescriptionItem>, epidemicReportRepository: Repository<EpidemicReport>, messageRepository: Repository<Message>, notificationRepository: Repository<Notification>, emergencyRepository: Repository<Emergency>, treatmentLogRepository: Repository<TreatmentLog>, qrService: QrService, pharmacyService: PharmacyService, usersService: UsersService);
    findAllByPatient(patientId: string): Promise<Consultation[]>;
    findAllByDoctor(doctorId: string): Promise<Consultation[]>;
    findOne(id: string): Promise<Consultation>;
    create(consultationData: Partial<Consultation>): Promise<Consultation>;
    private detectAndReportEpidemic;
    getQueue(): Promise<Consultation[]>;
    validatePrescription(token: string): Promise<Consultation>;
    dispense(token: string, pharmacistId?: string, pharmacyId?: string): Promise<Consultation>;
    getItemsForConsultation(consultationId: string): Promise<{
        cachet: {
            pharmacyName: string;
            pharmacyPhone: string;
            pharmacistName: string;
            pharmacistLicense: string;
            dispensedAt: Date;
            cachetToken: string;
        };
        id: string;
        consultation: Consultation;
        medicineName: string;
        dosage: string;
        quantity: number;
        timeOfDay: string;
        status: string;
        createdAt: Date;
    }[]>;
    addPrescriptionItems(consultationId: string, items: {
        medicineName: string;
        dosage?: string;
        quantity?: number;
        timeOfDay?: string;
    }[]): Promise<PrescriptionItem[]>;
    getItemsWithAvailability(token: string, pharmacyId?: string): Promise<{
        consultationId: string;
        isDispensed: boolean;
        items: {
            id: string;
            medicineName: string;
            dosage: string;
            quantity: number;
            status: string;
            stockDispo: number;
            disponible: boolean;
        }[];
    }>;
    dispenseItems(token: string, pharmacistId: string, pharmacyId: string | undefined, dispensedItems: {
        id: string;
        status: "DISPENSED" | "UNAVAILABLE";
    }[]): Promise<{
        consultationId: string;
        isDispensed: boolean;
        items: {
            id: string;
            medicineName: string;
            dosage: string;
            quantity: number;
            status: string;
            stockDispo: number;
            disponible: boolean;
        }[];
    }>;
    createTreatmentLog(patientId: string, dto: {
        consultationId: string;
        itemId: string;
        scheduledTime: string;
        status?: TreatmentLogStatus;
    }): Promise<TreatmentLog>;
    getTreatmentLogsByConsultation(consultationId: string): Promise<TreatmentLog[]>;
    getTreatmentProgress(patientId: string): Promise<any>;
    updateTreatmentLogStatus(logId: string, patientId: string, status: TreatmentLogStatus.TAKEN | TreatmentLogStatus.SKIPPED): Promise<TreatmentLog>;
    generateTreatmentLogsFromPrescription(consultationId: string, patientId: string): Promise<TreatmentLog[]>;
    reportEpidemic(doctor: any, reportData: any): Promise<EpidemicReport>;
    getEpidemicReports(doctorId?: string): Promise<EpidemicReport[]>;
    sendMessage(sender: any, receiverId: string, content: string): Promise<Message>;
    getMessages(userId: string): Promise<Message[]>;
    getNotifications(userId: string): Promise<Notification[]>;
    markNotificationAsRead(id: string, userId: string): Promise<void>;
    createNotification(userId: string, title: string, content: string, type: any, metadata?: any): Promise<Notification>;
    sendEmergency(caller: any, payload: any): Promise<Emergency>;
    getEmergencies(userId: string): Promise<Emergency[]>;
    acknowledgeEmergency(emergencyId: string): Promise<Emergency>;
    resolveEmergency(emergencyId: string, notes?: string): Promise<Emergency>;
}
