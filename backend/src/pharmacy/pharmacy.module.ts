import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PharmacyService } from "./pharmacy.service";
import { PharmacyController } from "./pharmacy.controller";
import { Pharmacy } from "./entities/pharmacy.entity";
import { MedicineStock } from "./entities/medicine-stock.entity";
import { PharmacyPrescription } from "./entities/pharmacy-prescription.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([Pharmacy, MedicineStock, PharmacyPrescription]),
  ],
  controllers: [PharmacyController],
  providers: [PharmacyService],
  exports: [PharmacyService],
})
export class PharmacyModule {}
