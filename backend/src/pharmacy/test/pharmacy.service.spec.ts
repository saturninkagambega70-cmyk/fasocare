import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { PharmacyService } from "../pharmacy.service";
import { Pharmacy } from "../entities/pharmacy.entity";
import { MedicineStock } from "../entities/medicine-stock.entity";

describe("PharmacyService", () => {
  let service: PharmacyService;
  let pharmacyRepo: any;
  let stockRepo: any;

  const mockPharmacyRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockStockRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PharmacyService,
        {
          provide: getRepositoryToken(Pharmacy),
          useValue: mockPharmacyRepo,
        },
        {
          provide: getRepositoryToken(MedicineStock),
          useValue: mockStockRepo,
        },
      ],
    }).compile();

    service = module.get<PharmacyService>(PharmacyService);
    pharmacyRepo = module.get(getRepositoryToken(Pharmacy));
    stockRepo = module.get(getRepositoryToken(MedicineStock));
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("findAll", () => {
    it("should return all pharmacies", async () => {
      pharmacyRepo.find.mockResolvedValue([{ id: "1" }]);
      const res = await service.findAll();
      expect(res).toHaveLength(1);
    });
  });

  describe("updateStock", () => {
    it("should update medicine stock", async () => {
      stockRepo.findOne.mockResolvedValue({
        id: "s1",
        quantity: 5,
        pharmacy: { admin: { id: "p1" } },
      });
      stockRepo.save.mockResolvedValue({ id: "s1", quantity: 50 });

      await service.updateStock("s1", 50);
      expect(stockRepo.save).toHaveBeenCalled();
    });
  });
});
