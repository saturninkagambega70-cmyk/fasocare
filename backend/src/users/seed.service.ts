import { Injectable, OnModuleInit } from "@nestjs/common";
import { UsersService } from "./users.service";
import * as bcrypt from "bcrypt";
import { UserRole, User } from "./entities/user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Consultation } from "../medical/entities/consultation.entity";
import { VaccinationRecord } from "../vaccination/entities/vaccination-record.entity";
import { Pharmacy } from "../pharmacy/entities/pharmacy.entity";

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    private usersService: UsersService,
    @InjectRepository(Consultation)
    private consultationRepository: Repository<Consultation>,
    @InjectRepository(VaccinationRecord)
    private vaccinationRepository: Repository<VaccinationRecord>,
    @InjectRepository(Pharmacy)
    private pharmacyRepository: Repository<Pharmacy>,
  ) {}

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
      } catch (err: any) {
        console.error("❌ Seed échoué:", err?.message || err);
      }
    }
  }

  private async seedUsers() {
    const passwordHash = await bcrypt.hash("1234", 10);

    // 1. Create Patient
    const patientPhone = "+22600000000";
    let patient = await this.usersService.findOneByPhone(patientPhone);
    if (!patient) {
      patient = await this.usersService.create({
        phone: patientPhone,
        passwordHash,
        roles: [UserRole.PATIENT],
        activeRole: UserRole.PATIENT,
      });
      console.log("Seed: Patient created");
    }

    // 2. Create Doctor
    const doctorPhone = "+22607070707";
    let doctor = await this.usersService.findOneByPhone(doctorPhone);
    if (!doctor) {
      doctor = await this.usersService.create({
        phone: doctorPhone,
        passwordHash,
        roles: [UserRole.DOCTOR],
        activeRole: UserRole.DOCTOR,
      });
      console.log("Seed: Doctor created");
    }

    // 3. Create Pharmacist
    const pharmacistPhone = "+22606060606";
    let pharmacist = await this.usersService.findOneByPhone(pharmacistPhone);
    if (!pharmacist) {
      pharmacist = await this.usersService.create({
        phone: pharmacistPhone,
        passwordHash,
        roles: [UserRole.PHARMACIST],
        activeRole: UserRole.PHARMACIST,
        name: "Pharmacien Principal",
        licenseNumber: "PHARM-001",
      });
      console.log("Seed: Pharmacist created");
    }

    // 4. Create Parent
    const parentPhone = "+22605050505";
    let parent = await this.usersService.findOneByPhone(parentPhone);
    if (!parent) {
      parent = await this.usersService.create({
        phone: parentPhone,
        passwordHash,
        roles: [UserRole.PARENT],
        activeRole: UserRole.PARENT,
      });
      console.log("Seed: Parent created");
    }

    // 5. Create Sample Consultations (empty - pas de données fictives)
    // 6. Create Sample Vaccinations (empty - pas de données fictives)
    // 7. Create Ministry & Inspector
    const ministryPhone = "+22601010101";
    if (!(await this.usersService.findOneByPhone(ministryPhone))) {
      await this.usersService.create({
        phone: ministryPhone,
        passwordHash,
        roles: [UserRole.HEALTH_MINISTRY],
        activeRole: UserRole.HEALTH_MINISTRY,
        name: "Direction Sanitaire Nationale",
      });
    }

    const inspectorPhone = "+22602020202";
    if (!(await this.usersService.findOneByPhone(inspectorPhone))) {
      await this.usersService.create({
        phone: inspectorPhone,
        passwordHash,
        roles: [UserRole.INSPECTOR],
        activeRole: UserRole.INSPECTOR,
        name: "Inspecteur Traoré",
      });
    }

    // 8. Create National Administrator
    const adminPhone = "+22601234567";
    if (!(await this.usersService.findOneByPhone(adminPhone))) {
      await this.usersService.create({
        phone: adminPhone,
        passwordHash,
        roles: [UserRole.ADMIN],
        activeRole: UserRole.ADMIN,
        name: "Administrateur National",
      });
      console.log("Seed: National Administrator created");
    }
  }

  private async seedDemoData() {
    // Pas de données démo fictives
  }

  private async seedHealthcareFacilities() {
    const facilities = await this.consultationRepository.query(
      "SELECT COUNT(*) FROM pharmacies",
    );
    if (parseInt(facilities[0].count) > 0) return;

    const admin = await this.usersService.findOneByPhone("+22601234567");
    if (!admin) return;

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
      } catch (e) {}
    }
    console.log("Seed: Établissements de santé créés");
  }
}
