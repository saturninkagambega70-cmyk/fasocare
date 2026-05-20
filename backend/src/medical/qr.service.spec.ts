import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { Test, TestingModule } from "@nestjs/testing";
import { QrService } from "./qr.service";
import { ConfigService } from "@nestjs/config";

describe("QrService", () => {
  let service: QrService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QrService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue("test-secret"),
          },
        },
      ],
    }).compile();

    service = module.get<QrService>(QrService);
  });

  it("should generate a token with HMAC signature", () => {
    const token = service.generateSecureToken("test-data");
    expect(token).toContain("test-data.");
    expect(token.split(".")[1]).toHaveLength(8);
  });

  it("should validate a correct token", () => {
    const token = service.generateSecureToken("real-data");
    expect(service.validateToken(token)).toBe(true);
  });

  it("should reject a tampered token", () => {
    const token = service.generateSecureToken("real-data");
    const tamperedToken = token.replace("real-data", "fake-data");
    expect(service.validateToken(tamperedToken)).toBe(false);
  });
});
