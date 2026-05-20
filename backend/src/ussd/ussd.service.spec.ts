import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { UssdService } from "./ussd.service";
import { VaccinationService } from "../vaccination/vaccination.service";
import { MedicalService } from "../medical/medical.service";
import { UsersService } from "../users/users.service";
import { TelecomService } from "../telecom/telecom.service";
import { User } from "../users/entities/user.entity";
import { UserRole } from "../users/entities/user.entity";

describe("UssdService", () => {
  let service: UssdService;
  let vaccinationService: any;
  let medicalService: any;
  const usersServiceMock = {
    findOneByPhone: jest.fn() as any,
  };

  const vaccinationServiceMock = {
    findLatestForPatient: jest.fn() as any,
  };

  const medicalServiceMock = {
    findAllByPatient: jest.fn() as any,
  };

  const telecomServiceMock = {
    sendSms: jest.fn() as any,
  };

  beforeEach(async () => {
    usersServiceMock.findOneByPhone.mockImplementation(
      async () =>
        ({
          id: "u1",
          phone: "70123456",
          role: UserRole.PATIENT,
        }) as any,
    );
    vaccinationServiceMock.findLatestForPatient.mockResolvedValue(null);
    medicalServiceMock.findAllByPatient.mockResolvedValue([]);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UssdService,
        {
          provide: VaccinationService,
          useValue: vaccinationServiceMock,
        },
        {
          provide: MedicalService,
          useValue: medicalServiceMock,
        },
        {
          provide: UsersService,
          useValue: usersServiceMock,
        },
        {
          provide: TelecomService,
          useValue: telecomServiceMock,
        },
        {
          provide: getRepositoryToken(User),
          useValue: {},
        },
        {
          provide: "REDIS_CLIENT",
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UssdService>(UssdService);
    vaccinationService = module.get(VaccinationService);
    medicalService = module.get(MedicalService);
  });

  it("should return welcome menu for empty text", async () => {
    const result = await service.processUssd("70123456", "", "s1");
    expect(result).toContain("CON Bienvenue FasoCare");
    expect(result).toContain("1. Mon Dossier Santé");
  });

  it("should return health menu for option 1", async () => {
    const result = await service.processUssd("70123456", "1", "s2");
    expect(result).toContain("CON Dossier Santé");
  });

  it("should handle report option 4", async () => {
    const result = await service.processUssd("70123456", "4", "s3");
    expect(result).toContain("CON Rapport Santé");
  });

  it("should reject unknown phone numbers", async () => {
    usersServiceMock.findOneByPhone.mockResolvedValueOnce(null);

    const result = await service.processUssd("+22600000000", "", "s4");

    expect(result).toContain("END Numéro inconnu");
  });

  it("should show vaccination details when latest record exists", async () => {
    vaccinationService.findLatestForPatient.mockResolvedValueOnce({
      vaccineName: "Polio",
      dateAdministered: new Date("2026-04-01T00:00:00.000Z"),
      nextDoseDate: new Date("2026-05-01T00:00:00.000Z"),
    });

    const result = await service.processUssd("70123456", "1*1", "s5");

    expect(result).toContain("END VACCINATION");
    expect(result).toContain("Polio");
    expect(result).toContain("01/04/2026");
    expect(result).toContain("01/05/2026");
  });

  it("should return latest consultation summary for past appointments", async () => {
    medicalService.findAllByPatient.mockResolvedValueOnce([
      {
        createdAt: new Date("2026-04-10T10:00:00.000Z"),
        doctor: { name: "Sana" },
        treatmentPlan: "Repos",
        diagnosis: "Paludisme simple",
      },
    ]);

    const result = await service.processUssd("70123456", "1*2", "s6");

    expect(result).toContain("END DERNIER RDV");
    expect(result).toContain("Dr. Sana");
    expect(result).toContain("Paludisme simple");
  });

  it("should confirm an appointment booking through the full flow", async () => {
    const result = await service.processUssd("70123456", "2*1*2*3", "s7");

    expect(result).toContain("END RDV CONFIRMÉ");
    expect(result).toContain("CSPS Pissy");
    expect(result).toContain("Pédiatre");
    expect(result).toContain("Cette semaine");
  });

  it("should return invalid option for unsupported main menu choices", async () => {
    const result = await service.processUssd("70123456", "9", "s8");

    expect(result).toContain("CON Option invalide");
    expect(result).toContain("Mon Dossier Santé");
  });
});
