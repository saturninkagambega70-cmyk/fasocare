import { UssdService } from "./ussd.service";
export declare class UssdController {
    private readonly ussdService;
    private readonly logger;
    constructor(ussdService: UssdService);
    private errorMessage;
    handleUssd(body: {
        phoneNumber: string;
        text: string;
        sessionId: string;
        serviceCode: string;
        networkCode?: string;
    }): Promise<{
        message: string;
    }>;
    testUssd(body: {
        phoneNumber: string;
        text?: string;
        sessionId?: string;
    }): Promise<{
        message: string;
    }>;
}
