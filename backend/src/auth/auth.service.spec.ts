import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "./auth.service";
import { UsersService } from "../users/users.service";
import { JwtService } from "@nestjs/jwt";
import { TelecomService } from "../telecom/telecom.service";
import { AppConfigService } from "../config/app-config.service";
import { TotpService } from "../common/totp.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { User } from "../users/entities/user.entity";
import * as bcrypt from "bcrypt";

describe("AuthService", () => {
  let service: AuthService;
  let usersService: UsersService;

  const mockUser = {
    id: "1",
    phone: "70000000",
    name: "Test",
    roles: ["PATIENT"],
    activeRole: "PATIENT",
    isVerified: true,
    passwordHash: bcrypt.hashSync("password123", 10),
  };

  const mockUsersService = {
    findOneByPhone: jest.fn(),
    findOneByPhoneWithSecurityFields: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        {
          provide: JwtService,
          useValue: { signAsync: jest.fn().mockResolvedValue("token") },
        },
        { provide: TelecomService, useValue: { sendSms: jest.fn() } },
        {
          provide: AppConfigService,
          useValue: {
            jwtSecret: "secret",
            jwtRefreshSecret: "secret",
            encryptionKey: "key",
            jwtAccessExpiration: 3600,
            jwtRefreshExpiration: 86400,
            isDevelopment: true,
            enableAutoVerification: true,
          },
        },
        {
          provide: TotpService,
          useValue: { generateSecret: jest.fn(), verifyToken: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("validateUser", () => {
    it("should return user sans passwordHash when credentials are valid", async () => {
      mockUsersService.findOneByPhoneWithSecurityFields.mockResolvedValue(
        mockUser,
      );
      const result = await service.validateUser("70000000", "password123");
      expect(result).toBeDefined();
      expect(result.passwordHash).toBeUndefined();
      expect(result.phone).toBe("70000000");
    });

    it("should return null when password is wrong", async () => {
      mockUsersService.findOneByPhoneWithSecurityFields.mockResolvedValue(
        mockUser,
      );
      const result = await service.validateUser("70000000", "wrongpassword");
      expect(result).toBeNull();
    });

    it("should return null when user not found", async () => {
      mockUsersService.findOneByPhoneWithSecurityFields.mockResolvedValue(null);
      const result = await service.validateUser("99999999", "password123");
      expect(result).toBeNull();
    });
  });

  describe("register", () => {
    it("should throw ConflictException when phone already exists", async () => {
      mockUsersService.findOneByPhone.mockResolvedValue(mockUser);
      await expect(
        service.register({
          phone: "70000000",
          password: "test1234",
          name: "Test",
        }),
      ).rejects.toThrow("Ce numéro est déjà enregistré.");
    });

    it("should create user and return tokens", async () => {
      mockUsersService.findOneByPhone.mockResolvedValue(null);
      mockUsersService.create.mockResolvedValue(mockUser);
      const result = await service.register({
        phone: "71234567",
        password: "test1234",
        name: "Nouveau",
      });
      expect(result).toBeDefined();
    });
  });
});
