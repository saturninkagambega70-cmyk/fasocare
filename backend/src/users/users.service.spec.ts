import { Test, TestingModule } from "@nestjs/testing";
import { UsersService } from "./users.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { AppConfigService } from "../config/app-config.service";

describe("UsersService", () => {
  let service: UsersService;

  const mockRepo = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      where: jest.fn().mockReturnThis(),
      getOne: jest.fn(),
    })),
  };

  const mockConfig = {
    encryptionKey:
      "b5101b9056da1e482cf367668fbddf4b9a14113f4630d8674e933c12a570357b",
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: mockRepo },
        { provide: AppConfigService, useValue: mockConfig },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  describe("cleanPhone", () => {
    it("should extract last 8 digits from full international number", () => {
      const result = (service as any).cleanPhone("+22670000000");
      expect(result).toBe("70000000");
    });

    it("should handle number with spaces", () => {
      const result = (service as any).cleanPhone("70 00 00 00");
      expect(result).toBe("70000000");
    });

    it("should handle 8-digit local number", () => {
      const result = (service as any).cleanPhone("70000000");
      expect(result).toBe("70000000");
    });

    it("should return empty string for null", () => {
      const result = (service as any).cleanPhone(null);
      expect(result).toBe("");
    });
  });
});
