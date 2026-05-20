import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { StatsService } from "./stats.service";
import { User, UserRole } from "../users/entities/user.entity";
import { Consultation } from "../medical/entities/consultation.entity";
import { VaccinationRecord } from "../vaccination/entities/vaccination-record.entity";
import { MedicineStock } from "../pharmacy/entities/medicine-stock.entity";
import { EpidemicReport } from "../medical/entities/epidemic-report.entity";

describe("StatsService", () => {
  let service: StatsService;

  const usersRepository = {
    count: jest.fn(),
  };

  const consultationsRepository = {
    count: jest.fn(),
    find: jest.fn(),
  };

  const vaccinationQueryBuilder = {
    select: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getRawOne: jest.fn(),
  };

  const vaccinationRepository = {
    count: jest.fn(),
    createQueryBuilder: jest.fn(() => vaccinationQueryBuilder),
  };

  const medicineStockRepository = {
    count: jest.fn(),
  };

  const epidemicReportRepository = {
    find: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StatsService,
        {
          provide: getRepositoryToken(User),
          useValue: usersRepository,
        },
        {
          provide: getRepositoryToken(Consultation),
          useValue: consultationsRepository,
        },
        {
          provide: getRepositoryToken(VaccinationRecord),
          useValue: vaccinationRepository,
        },
        {
          provide: getRepositoryToken(MedicineStock),
          useValue: medicineStockRepository,
        },
        {
          provide: getRepositoryToken(EpidemicReport),
          useValue: epidemicReportRepository,
        },
      ],
    }).compile();

    service = module.get<StatsService>(StatsService);
  });

  it("returns dashboard stats with trends", async () => {
    jest.spyOn<any, any>(service, "getDashboardTrends").mockResolvedValue({
      citizens: "+100%",
      vaccination: "+200%",
      consultations: "+100%",
      alerts: "+0%",
    });

    usersRepository.count.mockResolvedValueOnce(42).mockResolvedValueOnce(100);
    consultationsRepository.count.mockResolvedValueOnce(12);
    medicineStockRepository.count.mockResolvedValueOnce(3);
    vaccinationQueryBuilder.getRawOne.mockResolvedValueOnce({ count: "75" });

    const result = await service.getDashboardStats();

    expect(result).toEqual({
      statusCode: 200,
      success: true,
      data: {
        citizens: 42,
        vaccinationRate: 75,
        consultations: 12,
        stockAlerts: 3,
        trends: {
          citizens: "+100%",
          vaccination: "+200%",
          consultations: "+100%",
          alerts: "+0%",
        },
      },
    });
  });

  it("returns zero vaccination rate when there are no patients", async () => {
    usersRepository.count.mockResolvedValueOnce(0);

    const result = await service.getVaccinationRate();

    expect(result).toEqual({
      statusCode: 200,
      success: true,
      data: { rate: 0 },
    });
    expect(vaccinationRepository.createQueryBuilder).not.toHaveBeenCalled();
  });

  it("counts only patient users for vaccination rate", async () => {
    usersRepository.count.mockResolvedValueOnce(4);
    vaccinationQueryBuilder.getRawOne.mockResolvedValueOnce({ count: "3" });

    const result = await service.getVaccinationRate();

    expect(usersRepository.count).toHaveBeenCalledWith({
      where: { role: UserRole.PATIENT },
    });
    expect(result).toEqual({
      statusCode: 200,
      success: true,
      data: { rate: 75 },
    });
  });

  it("returns valid map data based on critical stock levels", async () => {
    medicineStockRepository.count.mockResolvedValueOnce(15);

    const result = await service.getMapData();

    expect(medicineStockRepository.count).toHaveBeenCalledWith({
      where: { quantity: expect.anything() },
    });

    expect(result.data.find((c) => c.name === "Ouagadougou")?.status).toBe(
      "ALERT",
    );
    expect(result.data.find((c) => c.name === "Bobo-Dioulasso")?.status).toBe(
      "CRITICAL",
    );
  });

  it("exports reports as CSV format", async () => {
    const fakeDate = new Date("2026-04-13T00:00:00.000Z");
    consultationsRepository.find.mockResolvedValueOnce([
      {
        id: "c1",
        createdAt: fakeDate,
        diagnosis: "Flu",
        urgencyLevel: "LOW",
        patient: { name: "Sankara" },
        doctor: { name: "Ki-Zerbo" },
      },
    ]);

    const csv = await service.exportReports();

    expect(csv).toContain(
      "ID_Consultation,Date,Patient,Docteur,Diagnostic,Niveau_Urgence\n",
    );
    expect(csv).toContain(
      '"c1","2026-04-13T00:00:00.000Z","Sankara","Ki-Zerbo","Flu","LOW"\n',
    );
  });
});
