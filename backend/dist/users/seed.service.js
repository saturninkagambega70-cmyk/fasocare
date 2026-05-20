"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeedService = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("./users.service");
const bcrypt = __importStar(require("bcrypt"));
const user_entity_1 = require("./entities/user.entity");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const consultation_entity_1 = require("../medical/entities/consultation.entity");
const vaccination_record_entity_1 = require("../vaccination/entities/vaccination-record.entity");
const pharmacy_entity_1 = require("../pharmacy/entities/pharmacy.entity");
let SeedService = class SeedService {
    constructor(usersService, consultationRepository, vaccinationRepository, pharmacyRepository) {
        this.usersService = usersService;
        this.consultationRepository = consultationRepository;
        this.vaccinationRepository = vaccinationRepository;
        this.pharmacyRepository = pharmacyRepository;
    }
    async onModuleInit() {
        const isTest = process.env.NODE_ENV === "test";
        if (!isTest) {
            console.log("🌱 Démarrage du seed FasoCare...");
            try {
                const usersCount = await this.usersService.count();
                if (usersCount > 0) {
                    console.log("✅ Base déjà-seedée,跳过");
                    return;
                }
                await this.seedUsers();
                await this.seedDemoData();
                await this.seedHealthcareFacilities();
                console.log("✅ Seed terminé!");
            }
            catch (err) {
                console.error("❌ Seed échoué:", err?.message || err);
            }
        }
    }
    async seedUsers() {
        const passwordHash = await bcrypt.hash("1234", 10);
        const patientPhone = "+22600000000";
        let patient = await this.usersService.findOneByPhone(patientPhone);
        if (!patient) {
            patient = await this.usersService.create({
                phone: patientPhone,
                passwordHash,
                roles: [user_entity_1.UserRole.PATIENT],
                activeRole: user_entity_1.UserRole.PATIENT,
            });
            console.log("Seed: Patient created");
        }
        const doctorPhone = "+22607070707";
        let doctor = await this.usersService.findOneByPhone(doctorPhone);
        if (!doctor) {
            doctor = await this.usersService.create({
                phone: doctorPhone,
                passwordHash,
                roles: [user_entity_1.UserRole.DOCTOR],
                activeRole: user_entity_1.UserRole.DOCTOR,
            });
            console.log("Seed: Doctor created");
        }
        const pharmacistPhone = "+22606060606";
        let pharmacist = await this.usersService.findOneByPhone(pharmacistPhone);
        if (!pharmacist) {
            pharmacist = await this.usersService.create({
                phone: pharmacistPhone,
                passwordHash,
                roles: [user_entity_1.UserRole.PHARMACIST],
                activeRole: user_entity_1.UserRole.PHARMACIST,
                name: "Pharmacien Principal",
                licenseNumber: "PHARM-001",
            });
            console.log("Seed: Pharmacist created");
        }
        const parentPhone = "+22605050505";
        let parent = await this.usersService.findOneByPhone(parentPhone);
        if (!parent) {
            parent = await this.usersService.create({
                phone: parentPhone,
                passwordHash,
                roles: [user_entity_1.UserRole.PARENT],
                activeRole: user_entity_1.UserRole.PARENT,
            });
            console.log("Seed: Parent created");
        }
        const ministryPhone = "+22601010101";
        if (!(await this.usersService.findOneByPhone(ministryPhone))) {
            await this.usersService.create({
                phone: ministryPhone,
                passwordHash,
                roles: [user_entity_1.UserRole.HEALTH_MINISTRY],
                activeRole: user_entity_1.UserRole.HEALTH_MINISTRY,
                name: "Direction Sanitaire Nationale",
            });
        }
        const inspectorPhone = "+22602020202";
        if (!(await this.usersService.findOneByPhone(inspectorPhone))) {
            await this.usersService.create({
                phone: inspectorPhone,
                passwordHash,
                roles: [user_entity_1.UserRole.INSPECTOR],
                activeRole: user_entity_1.UserRole.INSPECTOR,
                name: "Inspecteur Traoré",
            });
        }
        const adminPhone = "+22601234567";
        if (!(await this.usersService.findOneByPhone(adminPhone))) {
            await this.usersService.create({
                phone: adminPhone,
                passwordHash,
                roles: [user_entity_1.UserRole.ADMIN],
                activeRole: user_entity_1.UserRole.ADMIN,
                name: "Administrateur National",
            });
            console.log("Seed: National Administrator created");
        }
    }
    async seedDemoData() {
    }
    async seedHealthcareFacilities() {
        const facilities = await this.consultationRepository.query("SELECT COUNT(*) FROM pharmacies");
        if (parseInt(facilities[0].count) > 0)
            return;
        const admin = await this.usersService.findOneByPhone("+22601234567");
        if (!admin)
            return;
        const healthcareFacilities = [
            {
                name: "CSPS de Pissy",
                location: "12.3424,-1.5156",
                phone: "+22625301111",
                type: "CSPS",
            },
            {
                name: "CSPS de Kombissiri",
                location: "12.0897,-1.3362",
                phone: "+22625302222",
                type: "CSPS",
            },
            {
                name: "CMA de Koudougou",
                location: "12.2513,-2.3627",
                phone: "+22625303333",
                type: "CMA",
            },
            {
                name: "CHU de Bobo-Dioulasso",
                location: "11.1772,-4.2969",
                phone: "+22625304444",
                type: "CHU",
            },
            {
                name: "Centre de Santé de Ouagadougou",
                location: "12.3714,-1.5197",
                phone: "+22625305555",
                type: "Centre",
            },
        ];
        for (const facility of healthcareFacilities) {
            try {
                await this.pharmacyRepository.save({
                    name: facility.name,
                    location: facility.location,
                    phone: facility.phone,
                    admin,
                });
            }
            catch (e) { }
        }
        console.log("Seed: Établissements de santé créés");
    }
};
exports.SeedService = SeedService;
exports.SeedService = SeedService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(consultation_entity_1.Consultation)),
    __param(2, (0, typeorm_1.InjectRepository)(vaccination_record_entity_1.VaccinationRecord)),
    __param(3, (0, typeorm_1.InjectRepository)(pharmacy_entity_1.Pharmacy)),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], SeedService);
//# sourceMappingURL=seed.service.js.map