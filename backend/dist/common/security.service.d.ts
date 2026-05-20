export declare class SecurityService {
    private readonly algorithm;
    private readonly key;
    private readonly iv;
    encrypt(text: string): string;
    decrypt(text: string): string;
}
