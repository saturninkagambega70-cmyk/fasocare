import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { LabTest, LabTestStatus } from "./entities/lab-test.entity";

const TEST_CATALOG = [
  {
    name: "NFS (Numération Formule Sanguine)",
    category: "Hématologie",
    refMin: null,
    refMax: null,
    unit: "",
  },
  {
    name: "Glycémie à Jeun",
    category: "Biochimie",
    refMin: 0.7,
    refMax: 1.1,
    unit: "g/L",
  },
  { name: "HbA1c", category: "Biochimie", refMin: 4, refMax: 6, unit: "%" },
  {
    name: "Créatininémie",
    category: "Biochimie",
    refMin: 6,
    refMax: 12,
    unit: "mg/L",
  },
  {
    name: "TP (Taux de Prothrombine)",
    category: "Hémostase",
    refMin: 70,
    refMax: 100,
    unit: "%",
  },
  {
    name: "TS (Temps de Saignement)",
    category: "Hémostase",
    refMin: 2,
    refMax: 7,
    unit: "min",
  },
  {
    name: "VS (Vitesse de Sédimentation)",
    category: "Hématologie",
    refMin: 0,
    refMax: 20,
    unit: "mm/h",
  },
  {
    name: "CRP (Protéine C Réactive)",
    category: "Biochimie",
    refMin: 0,
    refMax: 6,
    unit: "mg/L",
  },
  {
    name: "Groupage ABO Rhésus",
    category: "Immunologie",
    refMin: null,
    refMax: null,
    unit: "",
  },
  {
    name: "Test de Paludisme (Goutte Épaisse)",
    category: "Parasitologie",
    refMin: null,
    refMax: null,
    unit: "",
  },
  {
    name: "Recherche BK (BACILLOSCOPIE)",
    category: "Bactériologie",
    refMin: null,
    refMax: null,
    unit: "",
  },
  {
    name: "Sérologie VIH",
    category: "Sérologie",
    refMin: null,
    refMax: null,
    unit: "",
  },
  {
    name: "Sérologie Hépatite B (Ag HBs)",
    category: "Sérologie",
    refMin: null,
    refMax: null,
    unit: "",
  },
  {
    name: "Sérologie Syphilis (TPHA-VDRL)",
    category: "Sérologie",
    refMin: null,
    refMax: null,
    unit: "",
  },
  {
    name: "Examen Cytobactériologique des Urines (ECBU)",
    category: "Bactériologie",
    refMin: null,
    refMax: null,
    unit: "",
  },
  {
    name: "Coproculture",
    category: "Parasitologie",
    refMin: null,
    refMax: null,
    unit: "",
  },
  {
    name: "Fer Sérique",
    category: "Biochimie",
    refMin: 0.6,
    refMax: 1.6,
    unit: "mg/L",
  },
  {
    name: "Albumine",
    category: "Biochimie",
    refMin: 35,
    refMax: 50,
    unit: "g/L",
  },
  {
    name: "Transaminases (ALAT/ASAT)",
    category: "Biochimie",
    refMin: 5,
    refMax: 40,
    unit: "UI/L",
  },
  {
    name: "Bilirubine Totale",
    category: "Biochimie",
    refMin: 2,
    refMax: 17,
    unit: "µmol/L",
  },
];

@Injectable()
export class LaboratoryService {
  constructor(
    @InjectRepository(LabTest)
    private labTestRepository: Repository<LabTest>,
  ) {}

  getCatalog() {
    return TEST_CATALOG;
  }

  async create(createDto: any): Promise<LabTest> {
    const labTest = this.labTestRepository.create(createDto);
    return this.labTestRepository.save(labTest as any);
  }

  async findAll(): Promise<LabTest[]> {
    return this.labTestRepository.find({
      relations: ["patient", "prescribedBy", "performedBy"],
    });
  }

  async findByPatient(patientId: string): Promise<LabTest[]> {
    return this.labTestRepository.find({
      where: { patient: { id: patientId } },
      relations: ["prescribedBy", "performedBy"],
    });
  }

  async findByPatientForRequester(
    patientId: string,
    requester: { userId: string; role: string },
  ): Promise<LabTest[]> {
    if (requester.role === "PATIENT" && requester.userId !== patientId) {
      throw new ForbiddenException("Accès interdit à ce dossier patient");
    }
    return this.findByPatient(patientId);
  }

  async updateResult(id: string, resultData: any): Promise<LabTest> {
    const labTest = await this.labTestRepository.findOne({ where: { id } });
    if (!labTest) {
      throw new NotFoundException(`Lab test with ID ${id} not found`);
    }

    labTest.resultValue = resultData.resultValue;
    labTest.notes = resultData.notes;
    labTest.status = LabTestStatus.COMPLETED;
    labTest.resultDate = new Date();
    labTest.performedBy = resultData.performedBy;

    return this.labTestRepository.save(labTest);
  }

  async findOne(id: string): Promise<LabTest> {
    const labTest = await this.labTestRepository.findOne({
      where: { id },
      relations: ["patient", "prescribedBy", "performedBy"],
    });
    if (!labTest) {
      throw new NotFoundException(`Lab test with ID ${id} not found`);
    }
    return labTest;
  }

  async findOneForRequester(
    id: string,
    requester: { userId: string; role: string },
  ): Promise<LabTest> {
    const labTest = await this.findOne(id);
    if (
      requester.role === "PATIENT" &&
      labTest.patient?.id !== requester.userId
    ) {
      throw new ForbiddenException("Accès interdit à ce test");
    }
    return labTest;
  }
}
