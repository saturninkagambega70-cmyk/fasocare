import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UsersService } from "./users.service";
import { User } from "./entities/user.entity";
import { SeedService } from "./seed.service";
import { Consultation } from "../medical/entities/consultation.entity";
import { VaccinationRecord } from "../vaccination/entities/vaccination-record.entity";
import { Pharmacy } from "../pharmacy/entities/pharmacy.entity";
import { AppConfigModule } from "../config/app-config.module";
import { MedicalModule } from "../medical/medical.module";

import { UsersController } from "./users.controller";

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Consultation, VaccinationRecord, Pharmacy]),
    AppConfigModule,
    forwardRef(() => MedicalModule),
  ],
  controllers: [UsersController],
  providers: [UsersService, SeedService],
  exports: [UsersService],
})
export class UsersModule {}
