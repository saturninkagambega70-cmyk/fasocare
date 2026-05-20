import { BadRequestException } from "@nestjs/common";
import { OtpService } from "./otp.service";

describe("OtpService", () => {
  let service: OtpService;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-04-11T09:00:00.000Z").getTime());
    service = new OtpService();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("generates and verifies a phone verification OTP", async () => {
    const generated = await service.generateAndSendOtp("70123456");

    await expect(
      service.verifyOtp("+22670123456", generated.code),
    ).resolves.toBe(true);
    expect(generated.expiresIn).toBe(600);
  });

  it("rejects the fourth OTP request within one hour for the same phone", async () => {
    const storage = (service as any).otpStorage as Map<string, unknown>;
    const now = new Date("2026-04-11T09:00:00.000Z");

    for (let index = 1; index <= 3; index += 1) {
      storage.set(`otp-${index}`, {
        id: `otp-${index}`,
        phoneNumber: "+22670123456",
        code: `00000${index}`,
        purpose: "PHONE_VERIFICATION",
        isUsed: false,
        attempts: 0,
        createdAt: now,
        expiresAt: new Date("2026-04-11T09:10:00.000Z"),
      });
    }

    await expect(service.generateAndSendOtp("+22670123456")).rejects.toThrow(
      new BadRequestException(
        "Trop de demandes OTP. Veuillez réessayer dans 1 heure.",
      ),
    );
  });

  it("expires OTPs after ten minutes", async () => {
    const generated = await service.generateAndSendOtp("+22670123456");

    jest.setSystemTime(new Date("2026-04-11T09:11:00.000Z").getTime());

    await expect(
      service.verifyOtp("+22670123456", generated.code),
    ).rejects.toThrow(
      new BadRequestException("OTP expiré. Veuillez en demander un nouveau."),
    );
  });

  it("cancels OTP after too many incorrect attempts", async () => {
    const generated = await service.generateAndSendOtp("+22670123456");

    for (let attempt = 1; attempt <= 5; attempt++) {
      await expect(service.verifyOtp("+22670123456", "000000")).rejects.toThrow(
        BadRequestException,
      );
    }

    await expect(
      service.verifyOtp("+22670123456", generated.code),
    ).rejects.toThrow(
      new BadRequestException(
        "Trop de tentatives. OTP annulé. Veuillez en demander un nouveau.",
      ),
    );
  });

  it("cleans up expired OTP records", async () => {
    await service.generateAndSendOtp("+22670123456");
    jest.setSystemTime(new Date("2026-04-11T09:11:00.000Z").getTime());

    expect(service.cleanupExpiredOtps()).toBe(1);
    await expect(service.verifyOtp("+22670123456", "123456")).rejects.toThrow(
      new BadRequestException("Aucun OTP trouvé pour ce numéro."),
    );
  });
});
