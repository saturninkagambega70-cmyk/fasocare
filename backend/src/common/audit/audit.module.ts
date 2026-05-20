import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuditLog } from "./entities/audit-log.entity";
import { AuditInterceptor } from "./audit.interceptor";

@Module({
  imports: [TypeOrmModule.forFeature([AuditLog])],
  providers: [AuditInterceptor],
  exports: [AuditInterceptor, TypeOrmModule],
})
export class AuditModule {}
