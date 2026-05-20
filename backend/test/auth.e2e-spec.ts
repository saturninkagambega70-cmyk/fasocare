import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "./../src/app.module";
import { getRepositoryToken } from "@nestjs/typeorm";
import { User } from "../src/users/entities/user.entity";
import { Repository } from "typeorm";
import * as bcrypt from "bcrypt";

describe("AuthController (e2e)", () => {
  let app: INestApplication;
  let userRepository: Repository<User>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    userRepository = moduleFixture.get<Repository<User>>(
      getRepositoryToken(User),
    );
  });

  beforeEach(async () => {
    await userRepository.clear();
  });

  afterAll(async () => {
    await app.close();
  });

  describe("POST /api/v1/auth/register", () => {
    it("should register a new patient", () => {
      return request(app.getHttpServer())
        .post("/api/v1/auth/register")
        .send({
          phone: "+22670000001",
          password: "securePassword123",
          name: "Test Patient",
          role: "PATIENT",
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty("access_token");
          expect(res.body).toHaveProperty("refresh_token");
          expect(res.body.user).toHaveProperty("phone", "+22670000001");
          expect(res.body.user).not.toHaveProperty("passwordHash");
        });
    });

    it("should fail with existing phone number", async () => {
      // Create user first
      await userRepository.save({
        phone: "+22670000002",
        passwordHash: await bcrypt.hash("password", 10),
        role: "PATIENT",
        isVerified: true,
      });

      return request(app.getHttpServer())
        .post("/api/v1/auth/register")
        .send({
          phone: "+22670000002",
          password: "securePassword123",
        })
        .expect(409)
        .expect((res) => {
          expect(res.body.message).toContain("déjà enregistré");
        });
    });

    it("should validate required fields", () => {
      return request(app.getHttpServer())
        .post("/api/v1/auth/register")
        .send({
          // missing phone
          password: "securePassword123",
        })
        .expect(400);
    });
  });

  describe("POST /api/v1/auth/login", () => {
    beforeEach(async () => {
      await userRepository.save({
        phone: "+22670000010",
        passwordHash: await bcrypt.hash("correctPassword", 10),
        role: "PATIENT",
        isVerified: true,
      });
    });

    it("should login with correct credentials", () => {
      return request(app.getHttpServer())
        .post("/api/v1/auth/login")
        .send({
          phone: "+22670000010",
          password: "correctPassword",
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty("access_token");
          expect(res.body).toHaveProperty("refresh_token");
        });
    });

    it("should reject wrong password", () => {
      return request(app.getHttpServer())
        .post("/api/v1/auth/login")
        .send({
          phone: "+22670000010",
          password: "wrongPassword",
        })
        .expect(401);
    });

    it("should reject non-existent user", () => {
      return request(app.getHttpServer())
        .post("/api/v1/auth/login")
        .send({
          phone: "+22670009999",
          password: "anyPassword",
        })
        .expect(401);
    });
  });

  describe("POST /api/v1/auth/refresh", () => {
    let refreshToken: string;
    let userId: string;

    beforeEach(async () => {
      const user = await userRepository.save({
        phone: "+22670000020",
        passwordHash: await bcrypt.hash("password", 10),
        role: "PATIENT",
        isVerified: true,
      });
      userId = user.id;

      const response = await request(app.getHttpServer())
        .post("/api/v1/auth/login")
        .send({
          phone: "+22670000020",
          password: "password",
        });

      refreshToken = response.body.refresh_token;
    });

    it("should refresh tokens with valid refresh token", () => {
      return request(app.getHttpServer())
        .post("/api/v1/auth/refresh")
        .send({
          userId: userId,
          refreshToken: refreshToken,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty("access_token");
          expect(res.body).toHaveProperty("refresh_token");
        });
    });

    it("should reject invalid refresh token", () => {
      return request(app.getHttpServer())
        .post("/api/v1/auth/refresh")
        .send({
          userId: userId,
          refreshToken: "invalid-token",
        })
        .expect(401);
    });
  });

  describe("POST /api/v1/auth/logout", () => {
    it("should logout user", async () => {
      const user = await userRepository.save({
        phone: "+22670000030",
        passwordHash: await bcrypt.hash("password", 10),
        role: "PATIENT",
        isVerified: true,
      });

      return request(app.getHttpServer())
        .post("/api/v1/auth/logout")
        .send({ userId: user.id })
        .expect(200);
    });
  });
});
