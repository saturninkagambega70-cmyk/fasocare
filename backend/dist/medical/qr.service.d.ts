import { ConfigService } from "@nestjs/config";
export declare class QrService {
    private configService;
    private readonly secret;
    constructor(configService: ConfigService);
    generateSecureToken(data: string): string;
    validateToken(token: string): boolean;
    hashPrescriptionContent(prescriptionText: string): string;
    generateRegistrationQr(patientId: string): string;
    generatePrescriptionToken(consultationId: string, prescriptionText?: string, doctorId?: string): string;
    validatePrescriptionIntegrity(token: string, currentPrescriptionText: string): boolean;
    extractDoctorId(token: string): string | null;
    generateConsentToken(patientId: string): string;
    generateRSAKeyPair(): {
        publicKey: string;
        privateKey: string;
    };
    signWithSecret(data: string): string;
}
