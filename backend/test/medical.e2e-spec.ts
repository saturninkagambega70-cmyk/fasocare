import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ExecutionContext } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "../src/app.module";
import { getRepositoryToken } from "@nestjs/typeorm";
import { User } from "../src/users/entities/user.entity";
import { Consultation } from "../src/medical/entities/consultation.entity";
import { Repository } from "typeorm";
import * as bcrypt from "bcrypt";
import { JwtAuthGuard } from "../src/auth/jwt-auth.guard";
import { RolesGuard } from "../src/auth/roles.guard";

describe("MedicalController (e2e)", () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  let consultationRepository: Repository<Consultation>;
  let doctorToken: string;
  let patientToken: string;
  let doctorId: string;
  let patientId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          const req = context.switchToHttp().getRequest();
          req.user = {
            userId: req.headers["x-user-id"],
            role: req.headers["x-user-role"],
          };
          return true;
        },
      })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    userRepository = moduleFixture.get<Repository<User>>(
      getRepositoryToken(User),
    );
    consultationRepository = moduleFixture.get<Repository<Consultation>>(
      getRepositoryToken(Consultation),
    );
  });

  beforeEach(async () => {
    await consultationRepository.clear();
    await userRepository.clear();

    // Create doctor
    const doctor = await userRepository.save({
      phone: "+22670000100",
      passwordHash: await bcrypt.hash("password", 10),
      name: "Dr. Test",
      role: "DOCTOR",
      isVerified: true,
      licenseNumber: "DOC123",
    });
    doctorId = doctor.id;

    // Create patient
    const patient = await userRepository.save({
      phone: "+22670000101",
      passwordHash: await bcrypt.hash("password", 10),
      name: "Test Patient",
      role: "PATIENT",
      isVerified: true,
    });
    patientId = patient.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe("POST /api/v1/medical/consultations", () => {
    it("should create a consultation with prescription", () => {
      return request(app.getHttpServer())
        .post("/api/v1/medical/consultations")
        .set("x-user-id", doctorId)
        .set("x-user-role", "DOCTOR")
        .send({
          patient: { id: patientId },
          doctor: { id: doctorId },
          diagnosis: "Test diagnosis",
          prescription: "Paracetamol 500mg",
          notes: "Follow up in 1 week",
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty("id");
          expect(res.body).toHaveProperty("qr_token");
          expect(res.body).toHaveProperty("qr_expiry");
          expect(res.body.diagnosis).toBe("Test diagnosis");
        });
    });

    it("should create consultation without prescription", () => {
      return request(app.getHttpServer())
        .post("/api/v1/medical/consultations")
        .set("x-user-id", doctorId)
        .set("x-user-role", "DOCTOR")
        .send({
          patient: { id: patientId },
          doctor: { id: doctorId },
          diagnosis: "Routine checkup",
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.qr_token).toBeNull();
        });
    });
  });

  describe("GET /api/v1/medical/consultations/patient/:id", () => {
    beforeEach(async () => {
      await consultationRepository.save({
        patient: { id: patientId },
        doctor: { id: doctorId },
        diagnosis: "Test diagnosis",
        prescription: "Medicine A",
      });
    });

    it("should get patient consultations", () => {
      return request(app.getHttpServer())
        .get(`/api/v1/medical/consultations/patient/${patientId}`)
        .set("x-user-id", patientId)
        .set("x-user-role", "PATIENT")
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
        });
    });
  });

  describe("POST /api/v1/medical/prescriptions/validate", () => {
    let validToken: string;

    beforeEach(async () => {
      const consultation = await consultationRepository.save({
        patient: { id: patientId },
        doctor: { id: doctorId },
        diagnosis: "Test",
        prescription: "Medicine B",
        qr_token: "RX-test-id-" + Date.now(),
        qr_expiry: new Date(Date.now() + 24 * 60 * 60 * 1000),
        isDispensed: false,
      });
      validToken = consultation.qr_token;
    });

    it("should validate a prescription token", () => {
      return request(app.getHttpServer())
        .post("/api/v1/medical/prescriptions/validate")
        .set("x-user-id", doctorId)
        .set("x-user-role", "PHARMACIST")
        .send({ token: validToken })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty("prescription");
        });
    });

    it("should reject invalid token", () => {
      return request(app.getHttpServer())
        .post("/api/v1/medical/prescriptions/validate")
        .set("x-user-id", doctorId)
        .set("x-user-role", "PHARMACIST")
        .send({ token: "invalid-token" })
        .expect(404);
    });
  });

  describe("POST /api/v1/medical/epidemic-reports", () => {
    it("should create epidemic report", () => {
      return request(app.getHttpServer())
        .post("/api/v1/medical/epidemic-reports")
        .set("x-user-id", doctorId)
        .set("x-user-role", "DOCTOR")
        .send({
          diseaseName: "Malaria",
          casesCount: 5,
          location: "Ouagadougou",
          symptoms: "Fever, headache",
          severity: "MODERATE",
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty("diseaseName", "Malaria");
          expect(res.body).toHaveProperty("status", "pending");
        });
    });
  });
});
