import { Injectable } from "@nestjs/common";
import * as crypto from "crypto";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class QrService {
  private readonly secret: string;

  constructor(private configService: ConfigService) {
    this.secret =
      this.configService.get<string>("JWT_SECRET") ||
      "faso-care-default-secret";
  }

  generateSecureToken(data: string): string {
    const hmac = crypto.createHmac("sha256", this.secret);
    hmac.update(data);
    const signature = hmac.digest("hex").substring(0, 8);
    return `${data}.${signature}`;
  }

  validateToken(token: string): boolean {
    const lastDot = token.lastIndexOf(".");
    if (lastDot === -1) return false;
    const data = token.substring(0, lastDot);
    const signature = token.substring(lastDot + 1);
    if (!data || !signature) return false;
    const hmac = crypto.createHmac("sha256", this.secret);
    hmac.update(data);
    return signature === hmac.digest("hex").substring(0, 8);
  }

  hashPrescriptionContent(prescriptionText: string): string {
    return crypto
      .createHash("sha256")
      .update(prescriptionText)
      .digest("hex")
      .substring(0, 12);
  }

  generateRegistrationQr(patientId: string): string {
    return this.generateSecureToken(`PAT-${patientId}-${Date.now()}`);
  }

  generatePrescriptionToken(
    consultationId: string,
    prescriptionText?: string,
    doctorId?: string,
  ): string {
    const expiry = Date.now() + 24 * 3600 * 1000;
    const cleanId = consultationId.replace(/-/g, "");
    let payload = `RX-${cleanId}-${expiry}`;
    if (prescriptionText) {
      const contentHash = this.hashPrescriptionContent(prescriptionText);
      payload += `-${contentHash}`;
    }
    if (doctorId) {
      const cleanDoctorId = doctorId.replace(/-/g, "");
      const doctorSig = this.signWithSecret(`${payload}-${cleanDoctorId}`);
      payload += `-DR-${cleanDoctorId}-${doctorSig}`;
    }
    return this.generateSecureToken(payload);
  }

  validatePrescriptionIntegrity(
    token: string,
    currentPrescriptionText: string,
  ): boolean {
    if (!this.validateToken(token)) return false;
    const lastDot = token.lastIndexOf(".");
    const data = token.substring(0, lastDot);
    const parts = data.split("-");
    // Find doctor signature marker (-DR-)
    const drIdx = parts.indexOf("DR");
    const hashPart = drIdx > 0 ? drIdx - 1 : parts.length - 1;
    if (hashPart < 3) return true; // legacy
    const embeddedHash = parts[hashPart];
    const currentHash = this.hashPrescriptionContent(currentPrescriptionText);
    return embeddedHash === currentHash;
  }

  extractDoctorId(token: string): string | null {
    if (!this.validateToken(token)) return null;
    const lastDot = token.lastIndexOf(".");
    const data = token.substring(0, lastDot);
    const parts = data.split("-");
    const drIdx = parts.indexOf("DR");
    if (drIdx < 0 || drIdx + 2 >= parts.length) return null;
    const cleanId = parts[drIdx + 1];
    if (cleanId.length === 32 && /^[0-9a-f]+$/.test(cleanId)) {
      return `${cleanId.substring(0, 8)}-${cleanId.substring(8, 12)}-${cleanId.substring(12, 16)}-${cleanId.substring(16, 20)}-${cleanId.substring(20)}`;
    }
    return cleanId;
  }

  generateConsentToken(patientId: string): string {
    return this.generateSecureToken(
      `CONSENT-${patientId}-${Date.now() + 2 * 3600 * 1000}`,
    );
  }

  generateRSAKeyPair(): { publicKey: string; privateKey: string } {
    const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
      modulusLength: 2048,
      publicKeyEncoding: { type: "spki", format: "pem" },
      privateKeyEncoding: { type: "pkcs8", format: "pem" },
    });
    return { publicKey, privateKey };
  }

  signWithSecret(data: string): string {
    const hmac = crypto.createHmac("sha256", this.secret);
    hmac.update(data);
    return hmac.digest("hex").substring(0, 8);
  }
}
