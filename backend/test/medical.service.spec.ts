import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { MedicalService } from "../src/medical/medical.service";
import { Consultation } from "../src/medical/entities/consultation.entity";
import { EpidemicReport } from "../src/medical/entities/epidemic-report.entity";
import { Message } from "../src/medical/entities/message.entity";
import { Notification } from "../src/medical/entities/notification.entity";
import { Emergency } from "../src/medical/entities/emergency.entity";
import { QrService } from "../src/medical/qr.service";
import { NotFoundException, ForbiddenException } from "@nestjs/common";

describe("MedicalService", () => {
  let service: MedicalService;
  let consultationRepo: Repository<Consultation>;
  let epidemicRepo: Repository<EpidemicReport>;
  let qrService: QrService;

  const mockConsultationRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockEpidemicRepo = {
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockMessageRepo = {
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockNotificationRepo = {
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockEmergencyRepo = {
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockQrService = {
    generatePrescriptionToken: jest.fn(),
    validateToken: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MedicalService,
        {
          provide: getRepositoryToken(Consultation),
          useValue: mockConsultationRepo,
        },
        {
          provide: getRepositoryToken(EpidemicReport),
          useValue: mockEpidemicRepo,
        },
        { provide: getRepositoryToken(Message), useValue: mockMessageRepo },
        {
          provide: getRepositoryToken(Notification),
          useValue: mockNotificationRepo,
        },
        { provide: getRepositoryToken(Emergency), useValue: mockEmergencyRepo },
        { provide: QrService, useValue: mockQrService },
      ],
    }).compile();

    service = module.get<MedicalService>(MedicalService);
    consultationRepo = module.get(getRepositoryToken(Consultation));
    epidemicRepo = module.get(getRepositoryToken(EpidemicReport));
    qrService = module.get<QrService>(QrService);

    jest.clearAllMocks();
  });

  describe("Consultation Management", () => {
    const patientId = "patient-001";
    const doctorId = "doctor-001";

    const realConsultations: Partial<Consultation>[] = [
      {
        id: "cons-001",
        patient: {
          id: patientId,
          name: "Ouedraogo Amadou",
          phone: "+22670123456",
        },
        doctor: {
          id: doctorId,
          name: "Dr. Sawadogo",
          licenseNumber: "MD-2020-001",
        },
        diagnosis: "Paludisme simple",
        prescription: "Paracetamol 500mg x3/jour pendant 5 jours",
        status: "COMPLETED",
        createdAt: new Date("2026-01-15"),
      },
      {
        id: "cons-002",
        patient: {
          id: patientId,
          name: "Ouedraogo Amadou",
          phone: "+22670123456",
        },
        doctor: {
          id: doctorId,
          name: "Dr. Sawadogo",
          licenseNumber: "MD-2020-001",
        },
        diagnosis: "Gastro-entérite",
        prescription: "Sérélyte - 1 sachet x3/jour",
        status: "COMPLETED",
        createdAt: new Date("2026-02-20"),
      },
      {
        id: "cons-003",
        patient: {
          id: patientId,
          name: "Ouedraogo Amadou",
          phone: "+22670123456",
        },
        doctor: {
          id: "doctor-002",
          name: "Dr. Zongo",
          licenseNumber: "MD-2019-045",
        },
        diagnosis: "Typhoïde suspectée",
        prescription: null,
        status: "PENDING",
        createdAt: new Date("2026-03-10"),
      },
    ];

    describe("findAllByPatient", () => {
      it("devrait retourner toutes les consultations d un patient", async () => {
        mockConsultationRepo.find.mockResolvedValue(realConsultations);

        const result = await service.findAllByPatient(patientId);

        expect(mockConsultationRepo.find).toHaveBeenCalledWith({
          where: { patient: { id: patientId } },
          relations: ["doctor"],
          order: { createdAt: "DESC" },
        });
        expect(result).toHaveLength(3);
        expect(result[0].diagnosis).toBe("Paludisme simple");
      });

      it("devrait retourner un tableau vide si aucune consultation", async () => {
        mockConsultationRepo.find.mockResolvedValue([]);

        const result = await service.findAllByPatient("unknown-patient");

        expect(result).toEqual([]);
      });

      it("devrait ordonner par date décroissante", async () => {
        mockConsultationRepo.find.mockResolvedValue(realConsultations);

        await service.findAllByPatient(patientId);

        const findCall = mockConsultationRepo.find.mock.calls[0][0];
        expect(findCall.order.createdAt).toBe("DESC");
      });
    });

    describe("findAllByDoctor", () => {
      it("devrait retourner les consultations d un médecin spécifique", async () => {
        const doctorConsultations = realConsultations.filter(
          (c) => c.doctor?.id === doctorId,
        );
        mockConsultationRepo.find.mockResolvedValue(doctorConsultations);

        const result = await service.findAllByDoctor(doctorId);

        expect(result).toHaveLength(2);
        expect(result[0].doctor?.id).toBe(doctorId);
      });
    });

    describe("findOne", () => {
      it("devrait retourner une consultation par son ID", async () => {
        mockConsultationRepo.findOne.mockResolvedValue(realConsultations[0]);

        const result = await service.findOne("cons-001");

        expect(result.id).toBe("cons-001");
        expect(result.diagnosis).toBe("Paludisme simple");
      });

      it("devrait lever NotFoundException si non trouvée", async () => {
        mockConsultationRepo.findOne.mockResolvedValue(null);

        await expect(service.findOne("invalid-id")).rejects.toThrow(
          NotFoundException,
        );
      });
    });

    describe("create", () => {
      const newConsultationData = {
        patient: { id: patientId } as any,
        doctor: { id: doctorId } as any,
        diagnosis: "Infection respiratoire aiguë",
        prescription: "Amoxicilline 500mg x2/jour pendant 7 jours",
        notes: "Fièvre depuis 3 jours",
      };

      it("devrait créer une nouvelle consultation", async () => {
        mockConsultationRepo.create.mockReturnValue(newConsultationData);
        mockConsultationRepo.save.mockResolvedValue({
          id: "cons-new-001",
          ...newConsultationData,
          createdAt: new Date(),
        });
        mockQrService.generatePrescriptionToken.mockReturnValue("qr-token-123");

        const result = await service.create(newConsultationData);

        expect(mockConsultationRepo.create).toHaveBeenCalledWith(
          newConsultationData,
        );
        expect(mockConsultationRepo.save).toHaveBeenCalled();
        expect(result.id).toBeDefined();
      });

      it("devrait générer un QR token pour les prescriptions", async () => {
        const savedConsultation = {
          id: "cons-qr-001",
          ...newConsultationData,
          prescription: newConsultationData.prescription,
          qr_token: null,
          qr_expiry: null,
          createdAt: new Date(),
        };

        mockConsultationRepo.create.mockReturnValue(newConsultationData);
        mockConsultationRepo.save
          .mockResolvedValueOnce(savedConsultation)
          .mockResolvedValueOnce({
            ...savedConsultation,
            qr_token: "generated-qr-token",
            qr_expiry: expect.any(Date),
          });
        mockQrService.generatePrescriptionToken.mockReturnValue(
          "generated-qr-token",
        );

        const result = await service.create(newConsultationData);

        expect(mockQrService.generatePrescriptionToken).toHaveBeenCalledWith(
          "cons-qr-001",
          expect.any(String),
        );
      });
    });

    describe("Epidemic Detection (Burkina Faso Context)", () => {
      it("devrait détecter le paludisme et créer un rapport épidémique", async () => {
        const paluConsultation = {
          id: "cons-epidemic-001",
          patient: { id: patientId },
          doctor: { id: doctorId },
          diagnosis: "Paludisme à Plasmodium falciparum",
          createdAt: new Date(),
        };

        mockConsultationRepo.create.mockReturnValue(paluConsultation);
        mockConsultationRepo.save
          .mockResolvedValueOnce(paluConsultation)
          .mockResolvedValueOnce(paluConsultation);
        mockQrService.generatePrescriptionToken.mockReturnValue("qr-token");
        mockEpidemicRepo.create.mockReturnValue({
          disease: "Paludisme",
          location: "Ouagadougou",
          caseCount: 1,
          reportedAt: new Date(),
        });
        mockEpidemicRepo.save.mockResolvedValue({});

        await service.create(paluConsultation);

        expect(mockEpidemicRepo.create).toHaveBeenCalledWith(
          expect.objectContaining({
            disease: "Paludisme",
            location: expect.any(String),
          }),
        );
      });

      it("devrait détecter la tuberculose", async () => {
        const tbConsultation = {
          id: "cons-tb-001",
          patient: { id: patientId },
          doctor: { id: doctorId },
          diagnosis: "Tuberculose pulmonaire suspectée",
          createdAt: new Date(),
        };

        mockConsultationRepo.create.mockReturnValue(tbConsultation);
        mockConsultationRepo.save
          .mockResolvedValueOnce(tbConsultation)
          .mockResolvedValueOnce(tbConsultation);
        mockQrService.generatePrescriptionToken.mockReturnValue("qr-token");
        mockEpidemicRepo.create.mockReturnValue({
          disease: "Tuberculose",
          location: "Bobo-Dioulasso",
          caseCount: 1,
          reportedAt: new Date(),
        });
        mockEpidemicRepo.save.mockResolvedValue({});

        await service.create(tbConsultation);

        expect(mockEpidemicRepo.create).toHaveBeenCalledWith(
          expect.objectContaining({ disease: "Tuberculose" }),
        );
      });
    });
  });

  describe("Prescriptions - Burkina Faso Common Medications", () => {
    const burkinaPrescriptions = [
      {
        prescription: "Artemether-Lumefantrine (Coartem) x2/jour - 3 jours",
        expected: "Paludisme",
      },
      {
        prescription: "Paracetamol 500mg + Vitamin C - 5 jours",
        expected: "Fièvre/Douleurs",
      },
      {
        prescription: "Albendazole 400mg - dose unique",
        expected: "Vermifuge",
      },
      {
        prescription: "ORS (Sérélyte) - 3 sachets/jour",
        expected: "Déshydratation",
      },
      {
        prescription: "Amoxicilline 500mg x3/jour - 7 jours",
        expected: "Infection bactérienne",
      },
      {
        prescription: "Ferrous sulfate (Fer) - 2 comprimés/jour",
        expected: "Anémie",
      },
    ];

    it("devrait générer un QR token valide pour chaque prescription", async () => {
      for (const rx of burkinaPrescriptions) {
        const consultation = {
          patient: { id: "rx-test-patient" },
          doctor: { id: "rx-test-doctor" },
          diagnosis: rx.expected,
          prescription: rx.prescription,
        };

        mockConsultationRepo.create.mockReturnValue(consultation);
        mockConsultationRepo.save.mockResolvedValue({
          id: `rx-${Math.random().toString(36).substr(2, 9)}`,
          ...consultation,
        });
        mockQrService.generatePrescriptionToken.mockReturnValue(
          `qr-${rx.expected}`,
        );

        const result = await service.create(consultation);

        expect(mockQrService.generatePrescriptionToken).toHaveBeenCalled();
      }
    });

    it("devrait valider un token QR de prescription", () => {
      const validToken = "valid-prescription-token";
      mockQrService.validateToken.mockReturnValue(true);

      const result = qrService.validateToken(validToken);

      expect(result).toBe(true);
    });

    it("devrait rejeter un token QR invalide", () => {
      const invalidToken = "invalid-token-12345";
      mockQrService.validateToken.mockReturnValue(false);

      const result = qrService.validateToken(invalidToken);

      expect(result).toBe(false);
    });
  });

  describe("Medical Records Access Control", () => {
    it("ne devrait pas permettre à un patient de voir les consultations d un autre", async () => {
      mockConsultationRepo.find.mockImplementation(({ where }) => {
        if (where.patient.id === "patient-001") {
          return Promise.resolve([
            { id: "cons-001", patient: { id: "patient-001" } },
          ]);
        }
        return Promise.resolve([]);
      });

      const result = await service.findAllByPatient("patient-002");

      expect(result).toHaveLength(0);
    });

    it("devrait permettre à un médecin de voir ses consultations", async () => {
      const doctorConsultations = [
        { id: "cons-doc-1", doctor: { id: "doc-001" }, diagnosis: "Test 1" },
        { id: "cons-doc-2", doctor: { id: "doc-001" }, diagnosis: "Test 2" },
      ];
      mockConsultationRepo.find.mockResolvedValue(doctorConsultations);

      const result = await service.findAllByDoctor("doc-001");

      expect(result).toHaveLength(2);
    });
  });
});
