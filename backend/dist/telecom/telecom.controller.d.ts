import { TelecomService } from "./telecom.service";
export declare class TelecomController {
    private readonly telecomService;
    constructor(telecomService: TelecomService);
    getVideoToken(room: string, req: any): Promise<{
        identity: string;
        room: string;
        token: string;
    }>;
}
