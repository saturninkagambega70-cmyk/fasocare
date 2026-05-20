import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { MedicalService } from "../medical.service";
import { Consultation } from "../entities/consultation.entity";
import { EpidemicReport } from "../entities/epidemic-report.entity";
import { Message } from "../entities/message.entity";
import { Notification } from "../entities/notification.entity";
import { Emergency } from "../entities/emergency.entity";
import { QrService } from "../qr.service";

describe("MedicalService", () => {
  let service: MedicalService;
  let repo: any;

  const mockConsultationRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };
  const mockEpidemicReportRepository = {
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };
  const mockMessageRepository = {
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };
  const mockNotificationRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
  };
  const mockEmergencyRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockQrService = {
    generatePrescriptionToken: jest.fn().mockReturnValue("mock-qr-token"),
    validateToken: jest.fn().mockReturnValue(true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MedicalService,
        {
          provide: getRepositoryToken(Consultation),
          useValue: mockConsultationRepository,
        },
        {
          provide: getRepositoryToken(EpidemicReport),
          useValue: mockEpidemicReportRepository,
        },
        {
          provide: getRepositoryToken(Message),
          useValue: mockMessageRepository,
        },
        {
          provide: getRepositoryToken(Notification),
          useValue: mockNotificationRepository,
        },
        {
          provide: getRepositoryToken(Emergency),
          useValue: mockEmergencyRepository,
        },
        {
          provide: QrService,
          useValue: mockQrService,
        },
      ],
    }).compile();

    service = module.get<MedicalService>(MedicalService);
    repo = module.get(getRepositoryToken(Consultation));
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("findAllByPatient", () => {
    it("should return an array of consultations", async () => {
      const result = [{ id: "1" }];
      repo.find.mockResolvedValue(result);
      expect(await service.findAllByPatient("p1")).toBe(result);
    });
  });

  describe("create", () => {
    it("should create and save a consultation", async () => {
      const dto = { diagnosis: "A fever" };
      repo.create.mockReturnValue(dto);
      repo.save.mockResolvedValue({ id: "1", ...dto });

      const res = await service.create(dto);
      expect(res).toBeDefined();
      expect(repo.save).toHaveBeenCalled();
    });

    it("should generate a QR token if prescription is present", async () => {
      const dtoWithRx = { diagnosis: "Fever", prescription: { meds: [] } };
      repo.create.mockReturnValue(dtoWithRx);
      repo.save.mockResolvedValue({ id: "1", ...dtoWithRx });

      await service.create(dtoWithRx);
      expect(mockQrService.generatePrescriptionToken).toHaveBeenCalled();
    });
  });
});
