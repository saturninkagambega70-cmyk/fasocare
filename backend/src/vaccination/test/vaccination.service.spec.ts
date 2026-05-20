import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { VaccinationService } from "../vaccination.service";
import { VaccinationRecord } from "../entities/vaccination-record.entity";

describe("VaccinationService", () => {
  let service: VaccinationService;
  let repo: any;

  const mockRepo = {
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VaccinationService,
        {
          provide: getRepositoryToken(VaccinationRecord),
          useValue: mockRepo,
        },
      ],
    }).compile();

    service = module.get<VaccinationService>(VaccinationService);
    repo = module.get(getRepositoryToken(VaccinationRecord));
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("findByPatient", () => {
    it("should return patient records", async () => {
      const records = [{ id: "1", patientId: "p1" }];
      repo.find.mockResolvedValue(records);
      const res = await service.findByPatient("p1");
      expect(res).toBe(records);
    });
  });

  describe("create", () => {
    it("should save a new vaccination record", async () => {
      const dto = { vaccineName: "BCG", patientId: "p1" };
      repo.create.mockReturnValue(dto);
      repo.save.mockResolvedValue({ id: "v1", ...dto });

      const res = await service.create(dto);
      expect(res.id).toBe("v1");
      expect(repo.save).toHaveBeenCalled();
    });
  });
});
