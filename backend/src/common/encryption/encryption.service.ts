import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as CryptoJS from "crypto-js";

/**
 * Service de chiffrement pour données sensibles (PII)
 * Utilise AES-256-CBC avec clés dérivées
 */
@Injectable()
export class EncryptionService {
  private readonly logger = new Logger(EncryptionService.name);
  private readonly masterKey: string;

  constructor(private configService: ConfigService) {
    this.masterKey = this.configService.get<string>("ENCRYPTION_KEY") || "";
    if (this.masterKey.length < 32) {
      this.logger.warn(
        "ENCRYPTION_KEY doit être d'au moins 32 caractères en production !",
      );
      // Fallback pour dev uniquement
      if (process.env.NODE_ENV !== "production") {
        this.masterKey = "dev-key-32-chars-long-for-testing-!";
      }
    }
  }

  /**
   * Chiffre une valeur texte
   */
  encrypt(value: string): string {
    if (!value) return value;
    try {
      return CryptoJS.AES.encrypt(value, this.masterKey).toString();
    } catch (error) {
      this.logger.error("Erreur chiffrement:", error);
      throw new Error("Encryption failed");
    }
  }

  /**
   * Déchiffre une valeur
   */
  decrypt(encryptedValue: string): string {
    if (!encryptedValue) return encryptedValue;
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedValue, this.masterKey);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      this.logger.error("Erreur déchiffrement:", error);
      throw new Error("Decryption failed - data may be corrupted");
    }
  }

  /**
   * Chiffre partiellement (pour affichage masqué)
   * Ex: +226 XX XX 00 01
   */
  maskPhone(phone: string): string {
    if (!phone || phone.length < 8) return phone;
    return phone.slice(0, 4) + " ** ** " + phone.slice(-2);
  }

  /**
   * Hash irréversible pour recherche (consentement, doublons)
   */
  hashForSearch(value: string): string {
    return CryptoJS.SHA256(value + this.masterKey).toString();
  }
}
