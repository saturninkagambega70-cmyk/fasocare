import { Injectable } from "@nestjs/common";
import * as crypto from "crypto";

@Injectable()
export class SecurityService {
  private readonly algorithm = "aes-256-cbc";
  private readonly key = crypto.scryptSync(
    process.env.ENCRYPTION_KEY || "fasocare_default_key",
    "salt",
    32,
  );
  private readonly iv = crypto.randomBytes(16);

  encrypt(text: string): string {
    const cipher = crypto.createCipheriv(this.algorithm, this.key, this.iv);
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    return `${this.iv.toString("hex")}:${encrypted}`;
  }

  decrypt(text: string): string {
    const [ivHex, encryptedHex] = text.split(":");
    const iv = Buffer.from(ivHex, "hex");
    const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
    let decrypted = decipher.update(encryptedHex, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  }
}
