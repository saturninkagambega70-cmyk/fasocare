import { Injectable } from "@nestjs/common";
import * as crypto from "crypto";

@Injectable()
export class TotpService {
  generateSecret(): string {
    return crypto.randomBytes(20).toString("hex");
  }

  generateTOTP(secret: string, window: number = 0): string {
    let counter = Math.floor(Date.now() / 30000) + window;
    const counterBuf = Buffer.alloc(8);
    for (let i = 7; i >= 0; i--) {
      counterBuf[i] = counter & 0xff;
      counter >>= 8;
    }
    const hmac = crypto.createHmac("sha1", Buffer.from(secret, "hex"));
    hmac.update(counterBuf);
    const result = hmac.digest();
    const offset = result[result.length - 1] & 0xf;
    const code =
      ((result[offset] & 0x7f) << 24) |
      ((result[offset + 1] & 0xff) << 16) |
      ((result[offset + 2] & 0xff) << 8) |
      (result[offset + 3] & 0xff);
    return String(code % 1000000).padStart(6, "0");
  }

  verifyTOTP(token: string, secret: string, windows: number = 2): boolean {
    for (let w = -windows; w <= windows; w++) {
      if (this.generateTOTP(secret, w) === token) return true;
    }
    return false;
  }

  getProvisioningUri(
    secret: string,
    email: string,
    issuer: string = "FasoCare",
  ): string {
    const encodedIssuer = encodeURIComponent(issuer);
    const encodedEmail = encodeURIComponent(email);
    return `otpauth://totp/${encodedIssuer}:${encodedEmail}?secret=${Buffer.from(secret, "hex").toString("base64").replace(/=/g, "")}&issuer=${encodedIssuer}&algorithm=SHA1&digits=6&period=30`;
  }

  generateBackupCodes(count: number = 8): string[] {
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
      codes.push(crypto.randomBytes(4).toString("hex").toUpperCase());
    }
    return codes;
  }
}
