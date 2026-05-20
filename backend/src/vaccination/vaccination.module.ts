import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { VaccinationService } from "./vaccination.service";
import { VaccinationController } from "./vaccination.controller";
import { VaccinationRecord } from "./entities/vaccination-record.entity";
import { UsersModule } from "../users/users.module";

@Module({
  imports: [TypeOrmModule.forFeature([VaccinationRecord]), UsersModule],
  providers: [VaccinationService],
  controllers: [VaccinationController],
  exports: [VaccinationService],
})
export class VaccinationModule {}
