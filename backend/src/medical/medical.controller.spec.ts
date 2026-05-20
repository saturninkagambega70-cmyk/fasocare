import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  jest,
} from "@jest/globals";
import { Test, TestingModule } from "@nestjs/testing";
import { MedicalController } from "./medical.controller";
import { MedicalService } from "./medical.service";
import { TriageService } from "./triage.service";
import { UserRole } from "../users/entities/user.entity";

describe("MedicalController", () => {
  let controller: MedicalController;

  const mockMedicalService = {
    findAllByPatient: jest.fn() as any,
    findAllByDoctor: jest.fn() as any,
    getQueue: jest.fn() as any,
    findOne: jest.fn() as any,
    create: jest.fn() as any,
    validatePrescription: jest.fn() as any,
    dispense: jest.fn() as any,
    reportEpidemic: jest.fn() as any,
    getEpidemicReports: jest.fn() as any,
    sendMessage: jest.fn() as any,
    getMessages: jest.fn() as any,
    getNotifications: jest.fn() as any,
    markNotificationAsRead: jest.fn() as any,
    sendEmergency: jest.fn() as any,
    getEmergencies: jest.fn() as any,
    acknowledgeEmergency: jest.fn() as any,
    resolveEmergency: jest.fn() as any,
  };

  const mockTriageService = {
    analyzeSymptoms: jest.fn() as any,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MedicalController],
      providers: [
        { provide: MedicalService, useValue: mockMedicalService },
        { provide: TriageService, useValue: mockTriageService },
      ],
    }).compile();

    controller = module.get<MedicalController>(MedicalController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("listConsultations", () => {
    it("should return patient consultations if patientId is provided", async () => {
      mockMedicalService.findAllByPatient.mockResolvedValue([{ id: "c1" }]);
      const result = await controller.listConsultations(
        "patient1",
        undefined,
        10,
      );
      expect(result.data.consultations).toEqual([{ id: "c1" }]);
      expect(mockMedicalService.findAllByPatient).toHaveBeenCalledWith(
        "patient1",
      );
    });

    it("should return doctor consultations if doctorId is provided", async () => {
      mockMedicalService.findAllByDoctor.mockResolvedValue([{ id: "c2" }]);
      const result = await controller.listConsultations(undefined, "doc1", 10);
      expect(result.data.consultations).toEqual([{ id: "c2" }]);
      expect(mockMedicalService.findAllByDoctor).toHaveBeenCalledWith("doc1");
    });

    it("should return queue if neither provided", async () => {
      mockMedicalService.getQueue.mockResolvedValue([{ id: "c3" }]);
      const result = await controller.listConsultations(
        undefined,
        undefined,
        10,
      );
      expect(result.data.consultations).toEqual([{ id: "c3" }]);
      expect(mockMedicalService.getQueue).toHaveBeenCalled();
    });
  });

  describe("createConsultationAPI", () => {
    it("should create consultation", async () => {
      mockMedicalService.create.mockResolvedValue({ id: "c1" });
      const req = { user: { userId: "doc1" } };
      const body = { patientId: "p1", diagnosis: "Flu" };

      const result = await controller.createConsultationAPI(body, req);
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ id: "c1" });
      expect(mockMedicalService.create).toHaveBeenCalledWith({
        patientId: "p1",
        diagnosis: "Flu",
        doctor: { id: "doc1" },
      });
    });

    it("should handle errors", async () => {
      mockMedicalService.create.mockRejectedValue(new Error("Invalid data"));
      const req = { user: { userId: "doc1" } };

      const result = await controller.createConsultationAPI({}, req);
      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(400);
    });
  });

  describe("triage", () => {
    it("should analyze symptoms successfully", async () => {
      mockTriageService.analyzeSymptoms.mockResolvedValue({ priority: "HIGH" });
      const result = await controller.triage({ symptoms: "Headache" });

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ priority: "HIGH" });
      expect(mockTriageService.analyzeSymptoms).toHaveBeenCalledWith(
        "Headache",
      );
    });

    it("should handle triage errors", async () => {
      mockTriageService.analyzeSymptoms.mockRejectedValue(
        new Error("AI Service Down"),
      );
      const result = await controller.triage({ symptoms: "Headache" });

      expect(result.success).toBe(false);
      expect(result.message).toBe("AI Service Down");
    });
  });
});
