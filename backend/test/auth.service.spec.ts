import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "../src/auth/auth.service";
import { JwtService } from "@nestjs/jwt";
import { getRepositoryToken } from "@nestjs/typeorm";
import { User } from "../src/users/entities/user.entity";
import { Repository } from "typeorm";
import { AppConfigService } from "../src/config/app-config.service";
import * as bcrypt from "bcrypt";
import {
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from "@nestjs/common";

describe("AuthService", () => {
  let service: AuthService;
  let userRepository: Repository<User>;
  let jwtService: JwtService;
  let appConfig: AppConfigService;

  const mockUser = {
    id: "123",
    phone: "+22670000001",
    passwordHash: "$2b$10$abcdefghijklmnopqrstuvwx", // bcrypt hash
    role: "PATIENT",
    isVerified: true,
    name: "Test User",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
            clear: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue("token"),
            verify: jest.fn(),
          },
        },
        {
          provide: AppConfigService,
          useValue: {
            jwtSecret: "test_secret",
            jwtRefreshSecret: "test_refresh_secret",
            jwtAccessExpiration: "15m",
            jwtRefreshExpiration: "7d",
            isProduction: false,
            isDevelopment: true,
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    jwtService = module.get<JwtService>(JwtService);
    appConfig = module.get<AppConfigService>(AppConfigService);
  });

  describe("register", () => {
    it("should create a new user with hashed password", async () => {
      const registerDto = {
        phone: "+22670000001",
        password: "securePassword123",
        name: "John Doe",
        role: "PATIENT",
      };

      jest.spyOn(userRepository, "findOne").mockResolvedValue(null);
      jest.spyOn(userRepository, "save").mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, "hash").mockResolvedValue("hashedPassword" as any);

      const result = await service.register(registerDto);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { phone: registerDto.phone },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10);
      expect(userRepository.save).toHaveBeenCalled();
      expect(result).toHaveProperty("access_token");
      expect(result).toHaveProperty("refresh_token");
    });

    it("should throw ConflictException if user already exists", async () => {
      const registerDto = {
        phone: "+22670000001",
        password: "securePassword123",
        name: "John Doe",
        role: "PATIENT",
      };

      jest.spyOn(userRepository, "findOne").mockResolvedValue(mockUser);

      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it("should validate password strength", async () => {
      const registerDto = {
        phone: "+22670000001",
        password: "123", // Too weak
        name: "John Doe",
        role: "PATIENT",
      };

      jest.spyOn(userRepository, "findOne").mockResolvedValue(null);

      await expect(service.register(registerDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe("login", () => {
    it("should return tokens for valid credentials", async () => {
      const loginDto = {
        phone: "+22670000001",
        password: "correctPassword",
      };

      jest.spyOn(userRepository, "findOne").mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, "compare").mockResolvedValue(true);

      const result = await service.login(loginDto);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { phone: loginDto.phone },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        loginDto.password,
        mockUser.passwordHash,
      );
      expect(result).toHaveProperty("access_token");
      expect(result).toHaveProperty("refresh_token");
    });

    it("should throw UnauthorizedException for invalid password", async () => {
      const loginDto = {
        phone: "+22670000001",
        password: "wrongPassword",
      };

      jest.spyOn(userRepository, "findOne").mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, "compare").mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it("should throw UnauthorizedException if user not found", async () => {
      const loginDto = {
        phone: "+22670009999",
        password: "anyPassword",
      };

      jest.spyOn(userRepository, "findOne").mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it("should throw UnauthorizedException if user is not verified", async () => {
      const unverifiedUser = { ...mockUser, isVerified: false };
      const loginDto = {
        phone: "+22670000001",
        password: "correctPassword",
      };

      jest.spyOn(userRepository, "findOne").mockResolvedValue(unverifiedUser);
      jest.spyOn(bcrypt, "compare").mockResolvedValue(true);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe("validateToken", () => {
    it("should validate correct JWT token", async () => {
      const token = "valid.jwt.token";
      jest.spyOn(jwtService, "verify").mockReturnValue({
        sub: "123",
        phone: "+22670000001",
      });

      const result = await service.validateToken(token);

      expect(jwtService.verify).toHaveBeenCalledWith(token, {
        secret: appConfig.jwtSecret,
      });
      expect(result).toHaveProperty("sub");
    });

    it("should throw UnauthorizedException for invalid token", async () => {
      const token = "invalid.jwt.token";
      jest.spyOn(jwtService, "verify").mockImplementation(() => {
        throw new Error("Invalid token");
      });

      await expect(service.validateToken(token)).rejects.toThrow();
    });
  });
});
