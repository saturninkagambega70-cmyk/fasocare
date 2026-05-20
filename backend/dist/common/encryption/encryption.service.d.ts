import { ConfigService } from "@nestjs/config";
export declare class EncryptionService {
    private configService;
    private readonly logger;
    private readonly masterKey;
    constructor(configService: ConfigService);
    encrypt(value: string): string;
    decrypt(encryptedValue: string): string;
    maskPhone(phone: string): string;
    hashForSearch(value: string): string;
}
