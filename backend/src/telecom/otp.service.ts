import { Injectable, Logger, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, LessThan } from "typeorm";

/**
 * OTP Entity - Stores one-time passwords for SMS/Email
 * Used for: Phone verification, Login without password, 2FA
 */
interface OtpRecord {
  id: string;
  phoneNumber: string;
  email?: string;
  code: string;
  purpose: "PHONE_VERIFICATION" | "LOGIN" | "PASSWORD_RESET" | "TRANSACTION";
  isUsed: boolean;
  attempts: number;
  createdAt: Date;
  expiresAt: Date;
}

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);
  private otpStorage: Map<string, OtpRecord> = new Map();
  private readonly OTP_LENGTH = 6;
  private readonly OTP_VALIDITY_MINUTES = 10;
  private readonly MAX_ATTEMPTS = 5;

  /**
   * Generate and send OTP
   * @param phoneNumber User's phone number (E.164 format: +226XXXXXXXX)
   * @param purpose OTP purpose (PHONE_VERIFICATION, LOGIN, etc)
   * @returns Generated OTP (for testing only - SMS sent separately)
   */
  async generateAndSendOtp(
    phoneNumber: string,
    purpose:
      | "PHONE_VERIFICATION"
      | "LOGIN"
      | "PASSWORD_RESET"
      | "TRANSACTION" = "PHONE_VERIFICATION",
  ): Promise<{ code: string; expiresIn: number }> {
    // Normalize phone number
    const normalizedPhone = this.normalizePhoneNumber(phoneNumber);

    // Check rate limiting - max 3 OTPs per hour per phone
    const recentOtps = Array.from(this.otpStorage.values()).filter(
      (otp) =>
        otp.phoneNumber === normalizedPhone &&
        otp.createdAt.getTime() > Date.now() - 60 * 60 * 1000,
    );

    if (recentOtps.length >= 3) {
      throw new BadRequestException(
        "Trop de demandes OTP. Veuillez réessayer dans 1 heure.",
      );
    }

    // Generate 6-digit OTP
    const code = this.generateRandomCode();
    const now = new Date();
    const expiresAt = new Date(
      now.getTime() + this.OTP_VALIDITY_MINUTES * 60 * 1000,
    );

    const otpRecord: OtpRecord = {
      id: `${normalizedPhone}-${purpose}-${Date.now()}`,
      phoneNumber: normalizedPhone,
      code,
      purpose,
      isUsed: false,
      attempts: 0,
      createdAt: now,
      expiresAt,
    };

    this.otpStorage.set(otpRecord.id, otpRecord);

    this.logger.log(
      `OTP Generated: Phone=${normalizedPhone}, Purpose=${purpose}, Code=${code}`,
    );

    // In production, send via SMS using TelecomService
    // await this.smsService.send(normalizedPhone, `Votre code de vérification FasoCare est: ${code}`)

    return {
      code, // Return code for testing (remove in production)
      expiresIn: this.OTP_VALIDITY_MINUTES * 60,
    };
  }

  /**
   * Verify OTP code
   * @param phoneNumber User's phone
   * @param code OTP code entered by user
   * @param purpose OTP purpose (must match generation)
   * @returns true if valid, throws exception otherwise
   */
  async verifyOtp(
    phoneNumber: string,
    code: string,
    purpose:
      | "PHONE_VERIFICATION"
      | "LOGIN"
      | "PASSWORD_RESET"
      | "TRANSACTION" = "PHONE_VERIFICATION",
  ): Promise<boolean> {
    const normalizedPhone = this.normalizePhoneNumber(phoneNumber);

    // Find matching OTP
    let otpRecord: OtpRecord | undefined;

    for (const otp of this.otpStorage.values()) {
      if (
        otp.phoneNumber === normalizedPhone &&
        otp.purpose === purpose &&
        !otp.isUsed
      ) {
        otpRecord = otp;
        break;
      }
    }

    if (!otpRecord) {
      throw new BadRequestException("Aucun OTP trouvé pour ce numéro.");
    }

    // Check expiration
    if (otpRecord.expiresAt < new Date()) {
      this.otpStorage.delete(otpRecord.id);
      throw new BadRequestException(
        "OTP expiré. Veuillez en demander un nouveau.",
      );
    }

    // Check attempts
    if (otpRecord.attempts >= this.MAX_ATTEMPTS) {
      this.otpStorage.delete(otpRecord.id);
      throw new BadRequestException(
        "Trop de tentatives. OTP annulé. Veuillez en demander un nouveau.",
      );
    }

    // Verify code
    if (otpRecord.code !== code) {
      otpRecord.attempts++;
      throw new BadRequestException(
        `Code incorrect. ${this.MAX_ATTEMPTS - otpRecord.attempts} tentatives restantes.`,
      );
    }

    // Mark as used
    otpRecord.isUsed = true;

    this.logger.log(
      `OTP Verified: Phone=${normalizedPhone}, Purpose=${purpose}`,
    );

    return true;
  }

  /**
   * Invalidate OTP (for manual cleanup)
   */
  async invalidateOtp(
    phoneNumber: string,
    purpose:
      | "PHONE_VERIFICATION"
      | "LOGIN"
      | "PASSWORD_RESET"
      | "TRANSACTION" = "PHONE_VERIFICATION",
  ): Promise<void> {
    const normalizedPhone = this.normalizePhoneNumber(phoneNumber);

    for (const [id, otp] of this.otpStorage) {
      if (otp.phoneNumber === normalizedPhone && otp.purpose === purpose) {
        this.otpStorage.delete(id);
      }
    }

    this.logger.log(`OTP Invalidated: Phone=${normalizedPhone}`);
  }

  /**
   * Cleanup expired OTPs (call periodically)
   */
  cleanupExpiredOtps(): number {
    const now = new Date();
    let count = 0;

    for (const [id, otp] of this.otpStorage) {
      if (otp.expiresAt < now) {
        this.otpStorage.delete(id);
        count++;
      }
    }

    if (count > 0) {
      this.logger.log(`Cleaned up ${count} expired OTPs`);
    }

    return count;
  }

  /**
   * Private helper: Generate random 6-digit code
   */
  private generateRandomCode(): string {
    return Math.floor(Math.random() * 10 ** this.OTP_LENGTH)
      .toString()
      .padStart(this.OTP_LENGTH, "0");
  }

  /**
   * Private helper: Normalize phone number to E.164 format
   * Input: "70123456" → Output: "+22670123456"
   */
  private normalizePhoneNumber(phone: string): string {
    let normalized = phone.replace(/\D/g, ""); // Remove non-digits

    if (normalized.startsWith("226")) {
      normalized = "+" + normalized;
    } else if (normalized.startsWith("0")) {
      normalized = "+226" + normalized.substring(1);
    } else if (!normalized.startsWith("+")) {
      // Assume Burkina Faso if no country code
      normalized = "+226" + normalized;
    }

    return normalized;
  }
}
