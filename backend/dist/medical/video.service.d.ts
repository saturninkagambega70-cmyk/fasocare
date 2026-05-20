import { ConfigService } from "@nestjs/config";
export declare class VideoService {
    private configService;
    constructor(configService: ConfigService);
    generateToken(identity: string, roomName: string): Promise<{
        token: string;
        room: string;
    }>;
}
