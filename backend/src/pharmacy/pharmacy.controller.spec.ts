import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  jest,
} from "@jest/globals";
import { Test, TestingModule } from "@nestjs/testing";
import { PharmacyController } from "./pharmacy.controller";
import { PharmacyService } from "./pharmacy.service";
import { UserRole } from "../users/entities/user.entity";

describe("PharmacyController", () => {
  let controller: PharmacyController;

  const mockPharmacyService = {
    findAll: jest.fn() as any,
    findByAdmin: jest.fn() as any,
    getStock: jest.fn() as any,
    updateStock: jest.fn() as any,
    getLowStockAlerts: jest.fn() as any,
    getStats: jest.fn() as any,
    createPharmacy: jest.fn() as any,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PharmacyController],
      providers: [{ provide: PharmacyService, useValue: mockPharmacyService }],
    }).compile();

    controller = module.get<PharmacyController>(PharmacyController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("findAll", () => {
    it("should return all pharmacies", async () => {
      mockPharmacyService.findAll.mockResolvedValue([{ id: "p1" }]);
      const result = await controller.findAll();
      expect(result).toEqual([{ id: "p1" }]);
      expect(mockPharmacyService.findAll).toHaveBeenCalled();
    });
  });

  describe("findMyPharmacies", () => {
    it("should return admin pharmacies", async () => {
      const req = { user: { userId: "admin1" } };
      mockPharmacyService.findByAdmin.mockResolvedValue([{ id: "p1" }]);

      const result = await controller.findMyPharmacies(req);
      expect(result).toEqual([{ id: "p1" }]);
      expect(mockPharmacyService.findByAdmin).toHaveBeenCalledWith("admin1");
    });
  });

  describe("getStock", () => {
    it("should return pharmacy stock", async () => {
      const req = { user: { userId: "admin1" } };
      mockPharmacyService.getStock.mockResolvedValue([{ id: "s1" }]);

      const result = await controller.getStock("p1", req);
      expect(result).toEqual([{ id: "s1" }]);
      expect(mockPharmacyService.getStock).toHaveBeenCalledWith("p1", req.user);
    });
  });

  describe("updateStock", () => {
    it("should update stock quantity", async () => {
      const req = { user: { userId: "admin1" } };
      mockPharmacyService.updateStock.mockResolvedValue({
        id: "s1",
        quantity: 10,
      });

      const result = await controller.updateStock("s1", 10, req);
      expect(result).toEqual({ id: "s1", quantity: 10 });
      expect(mockPharmacyService.updateStock).toHaveBeenCalledWith(
        "s1",
        10,
        req.user,
      );
    });
  });

  describe("getLowStockAlerts", () => {
    it("should return low stock alerts", async () => {
      const req = { user: { userId: "admin1" } };
      mockPharmacyService.getLowStockAlerts.mockResolvedValue([
        { id: "alert1" },
      ]);

      const result = await controller.getLowStockAlerts(req);
      expect(result).toEqual([{ id: "alert1" }]);
      expect(mockPharmacyService.getLowStockAlerts).toHaveBeenCalledWith(
        "admin1",
      );
    });
  });

  describe("getStats", () => {
    it("should return pharmacy stats", async () => {
      const req = { user: { userId: "admin1" } };
      mockPharmacyService.getStats.mockResolvedValue({ total: 10 });

      const result = await controller.getStats(req);
      expect(result).toEqual({ total: 10 });
      expect(mockPharmacyService.getStats).toHaveBeenCalledWith("admin1");
    });
  });

  describe("create", () => {
    it("should create pharmacy forcing admin if role is pharmacist", async () => {
      const req = {
        user: { userId: "pharmacist1", role: UserRole.PHARMACIST },
      };
      const data = { name: "Pharma Faso" };
      mockPharmacyService.createPharmacy.mockResolvedValue({ id: "p1" });

      const result = await controller.create(data, req);
      expect(result).toEqual({ id: "p1" });
      expect(mockPharmacyService.createPharmacy).toHaveBeenCalledWith({
        name: "Pharma Faso",
        admin: { id: "pharmacist1" },
      });
    });

    it("should create pharmacy normally for admin", async () => {
      const req = { user: { userId: "admin1", role: UserRole.ADMIN } };
      const data = { name: "Pharma Central", admin: { id: "someOtherId" } };
      mockPharmacyService.createPharmacy.mockResolvedValue({ id: "p2" });

      const result = await controller.create(data, req);
      expect(result).toEqual({ id: "p2" });
      expect(mockPharmacyService.createPharmacy).toHaveBeenCalledWith(data);
    });
  });
});
