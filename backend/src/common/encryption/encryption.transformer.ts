import { ValueTransformer } from "typeorm";
import * as CryptoJS from "crypto-js";

/**
 * TypeORM Value Transformer for automatic encryption and decryption of fields.
 * Note: Since this is used in Entity decorators, we cannot easily use DI (EncryptionService).
 * We use a static approach or read from process.env directly.
 */
export class EncryptionTransformer implements ValueTransformer {
  private static get encryptionKey(): string {
    const key = process.env.ENCRYPTION_KEY;
    if (!key) {
      throw new Error("ENCRYPTION_KEY is required");
    }
    return key;
  }

  // To (save to db)
  to(value: string | any): string | any {
    if (!value || typeof value !== "string") return value;
    try {
      return CryptoJS.AES.encrypt(
        value,
        EncryptionTransformer.encryptionKey,
      ).toString();
    } catch (error) {
      return value;
    }
  }

  // From (load from db)
  from(value: string | any): string | any {
    if (!value || typeof value !== "string") return value;
    try {
      const bytes = CryptoJS.AES.decrypt(
        value,
        EncryptionTransformer.encryptionKey,
      );
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      return decrypted || value;
    } catch (error) {
      return value;
    }
  }
}
