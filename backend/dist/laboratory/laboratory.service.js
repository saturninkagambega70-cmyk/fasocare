"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LaboratoryService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const lab_test_entity_1 = require("./entities/lab-test.entity");
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
let LaboratoryService = class LaboratoryService {
    constructor(labTestRepository) {
        this.labTestRepository = labTestRepository;
    }
    getCatalog() {
        return TEST_CATALOG;
    }
    async create(createDto) {
        const labTest = this.labTestRepository.create(createDto);
        return this.labTestRepository.save(labTest);
    }
    async findAll() {
        return this.labTestRepository.find({
            relations: ["patient", "prescribedBy", "performedBy"],
        });
    }
    async findByPatient(patientId) {
        return this.labTestRepository.find({
            where: { patient: { id: patientId } },
            relations: ["prescribedBy", "performedBy"],
        });
    }
    async findByPatientForRequester(patientId, requester) {
        if (requester.role === "PATIENT" && requester.userId !== patientId) {
            throw new common_1.ForbiddenException("Accès interdit à ce dossier patient");
        }
        return this.findByPatient(patientId);
    }
    async updateResult(id, resultData) {
        const labTest = await this.labTestRepository.findOne({ where: { id } });
        if (!labTest) {
            throw new common_1.NotFoundException(`Lab test with ID ${id} not found`);
        }
        labTest.resultValue = resultData.resultValue;
        labTest.notes = resultData.notes;
        labTest.status = lab_test_entity_1.LabTestStatus.COMPLETED;
        labTest.resultDate = new Date();
        labTest.performedBy = resultData.performedBy;
        return this.labTestRepository.save(labTest);
    }
    async findOne(id) {
        const labTest = await this.labTestRepository.findOne({
            where: { id },
            relations: ["patient", "prescribedBy", "performedBy"],
        });
        if (!labTest) {
            throw new common_1.NotFoundException(`Lab test with ID ${id} not found`);
        }
        return labTest;
    }
    async findOneForRequester(id, requester) {
        const labTest = await this.findOne(id);
        if (requester.role === "PATIENT" &&
            labTest.patient?.id !== requester.userId) {
            throw new common_1.ForbiddenException("Accès interdit à ce test");
        }
        return labTest;
    }
};
exports.LaboratoryService = LaboratoryService;
exports.LaboratoryService = LaboratoryService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(lab_test_entity_1.LabTest)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], LaboratoryService);
//# sourceMappingURL=laboratory.service.js.map