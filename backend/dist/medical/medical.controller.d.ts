import { MedicalService } from "./medical.service";
import { TriageService } from "./triage.service";
import { UsersService } from "../users/users.service";
export declare class MedicalController {
    private readonly medicalService;
    private readonly triageService;
    private readonly usersService;
    constructor(medicalService: MedicalService, triageService: TriageService, usersService: UsersService);
    listConsultations(patientId?: string, doctorId?: string, limit?: number, req?: any): Promise<{
        statusCode: number;
        success: boolean;
        data: {
            consultations: any[];
            total: number;
        };
    }>;
    getConsultation(id: string): Promise<{
        statusCode: number;
        success: boolean;
        data: import("./entities/consultation.entity").Consultation;
        message?: undefined;
    } | {
        statusCode: number;
        success: boolean;
        message: any;
        data?: undefined;
    }>;
    createConsultationAPI(body: any, req: any): Promise<{
        statusCode: number;
        success: boolean;
        data: import("./entities/consultation.entity").Consultation;
        message?: undefined;
    } | {
        statusCode: number;
        success: boolean;
        message: any;
        data?: undefined;
    }>;
    getPatientHistory(patientId: string, req: any): Promise<{
        statusCode: number;
        success: boolean;
        data: {
            items: {
                cachet: {
                    pharmacyName: string;
                    pharmacyPhone: string;
                    pharmacistName: string;
                    pharmacistLicense: string;
                    dispensedAt: Date;
                    cachetToken: string;
                };
                id: string;
                consultation: import("./entities/consultation.entity").Consultation;
                medicineName: string;
                dosage: string;
                quantity: number;
                timeOfDay: string;
                status: string;
                createdAt: Date;
            }[];
            id: string;
            patient: import("../users/entities/user.entity").User;
            doctor: import("../users/entities/user.entity").User;
            diagnosis: string;
            treatmentPlan: string;
            temperature: number;
            weight: number;
            pulse: number;
            bloodPressure: string;
            urgencyLevel: string;
            hospital: string;
            prescription: any;
            isDispensed: boolean;
            dispensedAt: Date;
            qr_token: string;
            qr_expiry: Date;
            createdAt: Date;
        }[];
        message?: undefined;
    } | {
        statusCode: number;
        success: boolean;
        message: any;
        data?: undefined;
    }>;
    getHistory(req: any): Promise<import("./entities/consultation.entity").Consultation[] | {
        statusCode: number;
        success: boolean;
        data: {
            items: {
                cachet: {
                    pharmacyName: string;
                    pharmacyPhone: string;
                    pharmacistName: string;
                    pharmacistLicense: string;
                    dispensedAt: Date;
                    cachetToken: string;
                };
                id: string;
                consultation: import("./entities/consultation.entity").Consultation;
                medicineName: string;
                dosage: string;
                quantity: number;
                timeOfDay: string;
                status: string;
                createdAt: Date;
            }[];
            id: string;
            patient: import("../users/entities/user.entity").User;
            doctor: import("../users/entities/user.entity").User;
            diagnosis: string;
            treatmentPlan: string;
            temperature: number;
            weight: number;
            pulse: number;
            bloodPressure: string;
            urgencyLevel: string;
            hospital: string;
            prescription: any;
            isDispensed: boolean;
            dispensedAt: Date;
            qr_token: string;
            qr_expiry: Date;
            createdAt: Date;
        }[];
    }>;
    getMyConsultations(req: any): Promise<{
        statusCode: number;
        success: boolean;
        data: import("./entities/consultation.entity").Consultation[];
        message?: undefined;
    } | {
        statusCode: number;
        success: boolean;
        message: any;
        data?: undefined;
    }>;
    createConsultation(body: any, req: any): Promise<import("./entities/consultation.entity").Consultation>;
    getQueue(): Promise<import("./entities/consultation.entity").Consultation[]>;
    getLatestPatients(): Promise<import("./entities/consultation.entity").Consultation[]>;
    validatePrescription(token: string): Promise<import("./entities/consultation.entity").Consultation>;
    dispense(token: string, body: {
        pharmacyId?: string;
    }, req: any): Promise<import("./entities/consultation.entity").Consultation>;
    addPrescriptionItems(id: string, items: {
        medicineName: string;
        dosage?: string;
        quantity?: number;
    }[]): Promise<import("./entities/prescription-item.entity").PrescriptionItem[]>;
    getPrescriptionItems(id: string): Promise<{
        cachet: {
            pharmacyName: string;
            pharmacyPhone: string;
            pharmacistName: string;
            pharmacistLicense: string;
            dispensedAt: Date;
            cachetToken: string;
        };
        id: string;
        consultation: import("./entities/consultation.entity").Consultation;
        medicineName: string;
        dosage: string;
        quantity: number;
        timeOfDay: string;
        status: string;
        createdAt: Date;
    }[]>;
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
    dispenseItems(token: string, body: {
        items: {
            id: string;
            status: "DISPENSED" | "UNAVAILABLE";
        }[];
        pharmacyId?: string;
    }, req: any): Promise<{
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
    reportEpidemic(body: any, req: any): Promise<import("./entities/epidemic-report.entity").EpidemicReport>;
    getEpidemicReports(req: any): Promise<import("./entities/epidemic-report.entity").EpidemicReport[]>;
    sendMessage(body: {
        receiverId: string;
        content: string;
    }, req: any): Promise<import("./entities/message.entity").Message>;
    getMessages(req: any): Promise<import("./entities/message.entity").Message[]>;
    getNotifications(req: any): Promise<import("./entities/notification.entity").Notification[]>;
    markAsRead(id: string, req: any): Promise<void>;
    sendEmergency(body: any, req: any): Promise<{
        statusCode: number;
        success: boolean;
        message: string;
        data: import("./entities/emergency.entity").Emergency;
    } | {
        statusCode: number;
        success: boolean;
        message: any;
        data?: undefined;
    }>;
    sendEmergencyCompat(body: any, req: any): Promise<{
        statusCode: number;
        success: boolean;
        message: string;
        data: import("./entities/emergency.entity").Emergency;
    } | {
        statusCode: number;
        success: boolean;
        message: any;
        data?: undefined;
    }>;
    getEmergenciesCompat(req: any): Promise<{
        statusCode: number;
        success: boolean;
        data: import("./entities/emergency.entity").Emergency[];
        message?: undefined;
    } | {
        statusCode: number;
        success: boolean;
        message: any;
        data?: undefined;
    }>;
    getEmergencies(req: any): Promise<{
        statusCode: number;
        success: boolean;
        data: import("./entities/emergency.entity").Emergency[];
        message?: undefined;
    } | {
        statusCode: number;
        success: boolean;
        message: any;
        data?: undefined;
    }>;
    acknowledgeEmergency(id: string): Promise<{
        statusCode: number;
        success: boolean;
        message: string;
        data: import("./entities/emergency.entity").Emergency;
    } | {
        statusCode: number;
        success: boolean;
        message: any;
        data?: undefined;
    }>;
    resolveEmergency(id: string, body?: {
        notes?: string;
    }): Promise<{
        statusCode: number;
        success: boolean;
        message: string;
        data: import("./entities/emergency.entity").Emergency;
    } | {
        statusCode: number;
        success: boolean;
        message: any;
        data?: undefined;
    }>;
    logTreatment(body: {
        consultationId: string;
        itemId: string;
        scheduledTime: string;
        status?: string;
    }, req: any): Promise<{
        statusCode: number;
        success: boolean;
        data: import("./entities/treatment-log.entity").TreatmentLog;
        message?: undefined;
    } | {
        statusCode: number;
        success: boolean;
        message: any;
        data?: undefined;
    }>;
    getMyTreatmentProgress(req: any): Promise<{
        statusCode: number;
        success: boolean;
        data: any;
        message?: undefined;
    } | {
        statusCode: number;
        success: boolean;
        message: any;
        data?: undefined;
    }>;
    getPatientTreatmentProgress(patientId: string, req: any): Promise<{
        statusCode: number;
        success: boolean;
        data: any;
        message?: undefined;
    } | {
        statusCode: number;
        success: boolean;
        message: any;
        data?: undefined;
    }>;
    getConsultationTreatmentLogs(id: string): Promise<{
        statusCode: number;
        success: boolean;
        data: import("./entities/treatment-log.entity").TreatmentLog[];
        message?: undefined;
    } | {
        statusCode: number;
        success: boolean;
        message: any;
        data?: undefined;
    }>;
    updateTreatmentLogStatus(id: string, body: {
        status: "TAKEN" | "SKIPPED";
    }, req: any): Promise<{
        statusCode: number;
        success: boolean;
        data: import("./entities/treatment-log.entity").TreatmentLog;
        message?: undefined;
    } | {
        statusCode: number;
        success: boolean;
        message: any;
        data?: undefined;
    }>;
    generateTreatmentLogs(id: string, req: any): Promise<{
        statusCode: number;
        success: boolean;
        data: import("./entities/treatment-log.entity").TreatmentLog[];
        message: string;
    } | {
        statusCode: number;
        success: boolean;
        message: any;
        data?: undefined;
    }>;
    triage(body: {
        symptoms: string;
    }): Promise<{
        statusCode: number;
        success: boolean;
        data: import("./triage.service").TriageResult;
        message?: undefined;
    } | {
        statusCode: number;
        success: boolean;
        message: any;
        data?: undefined;
    }>;
}
