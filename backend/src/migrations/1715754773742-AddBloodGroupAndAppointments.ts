import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class AddBloodGroupAndAppointments1715754773742 implements MigrationInterface {
  name = "AddBloodGroupAndAppointments1715754773742";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add bloodGroup column to users table
    await queryRunner.query(
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "bloodGroup" character varying`,
    );

    // Create appointments table (if not exists)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "appointments" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "patientId" uuid,
        "doctorId" uuid,
        "date" date NOT NULL,
        "time" time NOT NULL,
        "reason" character varying,
        "notes" character varying,
        "facility" character varying,
        "status" character varying NOT NULL DEFAULT 'PENDING',
        "cancelledAt" TIMESTAMP,
        "completedAt" TIMESTAMP,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_appointments" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `ALTER TABLE "appointments" ADD CONSTRAINT "FK_appointments_patient" FOREIGN KEY ("patientId") REFERENCES "users"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointments" ADD CONSTRAINT "FK_appointments_doctor" FOREIGN KEY ("doctorId") REFERENCES "users"("id") ON DELETE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "bloodGroup"`);
    await queryRunner.dropTable("appointments");
  }
}
