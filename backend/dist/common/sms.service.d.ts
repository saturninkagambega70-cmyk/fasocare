export declare class SmsService {
    sendSms(to: string, message: string): Promise<{
        status: string;
    }>;
}
