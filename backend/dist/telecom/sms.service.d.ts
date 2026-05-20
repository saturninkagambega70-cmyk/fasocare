import { TelecomService } from "./telecom.service";
export interface SmsResponse {
    status: string;
    [key: string]: any;
}
export declare class SmsService {
    private readonly telecomService;
    private readonly logger;
    constructor(telecomService: TelecomService);
    send(recipients: string | string[], message: string): Promise<SmsResponse>;
    sendOtp(phoneNumber: string, code: string): Promise<void>;
    sendAppointmentConfirmation(phoneNumber: string, data: {
        referenceCode: string;
        facilityName: string;
        date: string;
        time?: string;
    }): Promise<void>;
    sendHealthAlert(phoneNumber: string, data: {
        title: string;
        message: string;
        actionUrl?: string;
    }): Promise<void>;
    broadcast(recipients: string[], message: string): Promise<SmsResponse>;
}
