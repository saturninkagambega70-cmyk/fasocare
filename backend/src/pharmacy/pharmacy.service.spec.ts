import { Test, TestingModule } from "@nestjs/testing";
import { PharmacyService } from "./pharmacy.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Pharmacy } from "./entities/pharmacy.entity";
import { PharmacyPrescription } from "./entities/pharmacy-prescription.entity";
import { MedicineStock } from "./entities/medicine-stock.entity";

describe("PharmacyService", () => {
  let service: PharmacyService;

  const mockPharmacyRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };
  const mockPrescriptionRepo = {
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };
  const mockStockRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    count: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PharmacyService,
        { provide: getRepositoryToken(Pharmacy), useValue: mockPharmacyRepo },
        {
          provide: getRepositoryToken(PharmacyPrescription),
          useValue: mockPrescriptionRepo,
        },
        { provide: getRepositoryToken(MedicineStock), useValue: mockStockRepo },
      ],
    }).compile();

    service = module.get<PharmacyService>(PharmacyService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("findAll", () => {
    it("should return pharmacies with admin relation", async () => {
      mockPharmacyRepo.find.mockResolvedValue([
        { id: "1", name: "Pharmacie Test" },
      ]);
      const result = await service.findAll();
      expect(result).toHaveLength(1);
      expect(mockPharmacyRepo.find).toHaveBeenCalledWith({
        relations: ["admin"],
      });
    });
  });

  describe("findByAdmin", () => {
    it("should return pharmacies for given admin", async () => {
      mockPharmacyRepo.find.mockResolvedValue([{ id: "1", name: "Ma Pharma" }]);
      const result = await service.findByAdmin("admin-1");
      expect(result).toHaveLength(1);
    });
  });
});
