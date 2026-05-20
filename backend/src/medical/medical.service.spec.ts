import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { MedicalService } from "./medical.service";
import { QrService } from "./qr.service";
import { Consultation } from "./entities/consultation.entity";
import { EpidemicReport } from "./entities/epidemic-report.entity";
import { Message } from "./entities/message.entity";
import { Notification } from "./entities/notification.entity";
import { Emergency } from "./entities/emergency.entity";

describe("MedicalService", () => {
  let service: MedicalService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MedicalService,
        {
          provide: getRepositoryToken(Consultation),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(EpidemicReport),
          useValue: { find: jest.fn(), create: jest.fn(), save: jest.fn() },
        },
        {
          provide: getRepositoryToken(Message),
          useValue: { find: jest.fn(), create: jest.fn(), save: jest.fn() },
        },
        {
          provide: getRepositoryToken(Notification),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Emergency),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: QrService,
          useValue: {
            generatePrescriptionToken: jest
              .fn()
              .mockReturnValue("mock-qr-token"),
            validateToken: jest.fn().mockReturnValue(true),
          },
        },
      ],
    }).compile();

    service = module.get<MedicalService>(MedicalService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
