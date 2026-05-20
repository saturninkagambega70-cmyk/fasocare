export declare class TelecomService {
    private readonly at;
    constructor();
    sendSms(to: string, message: string): Promise<any>;
    generateVideoToken(identity: string, room: string): Promise<{
        identity: string;
        room: string;
        token: string;
    }>;
}
