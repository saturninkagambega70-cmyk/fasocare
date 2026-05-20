export declare class EncryptionService {
    private readonly algorithm;
    private readonly key;
    encrypt(text: string): {
        iv: string;
        encryptedData: string;
    };
    decrypt(encryptedData: string, iv: string): string;
}
