import { ConsentService } from "./consent.service";
export declare class ConsentController {
    private readonly consentService;
    constructor(consentService: ConsentService);
    grantConsent(req: any, body: {
        consentType: string;
    }): Promise<import("./entities/consent.entity").Consent>;
    revokeConsent(req: any, body: {
        consentType: string;
    }): Promise<import("./entities/consent.entity").Consent>;
    getMyConsents(req: any): Promise<import("./entities/consent.entity").Consent[]>;
    deleteAccount(req: any): Promise<void>;
}
