import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1775754773741 implements MigrationInterface {
  name = "InitialSchema1775754773741";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum type for user roles
    await queryRunner.query(`
            CREATE TYPE "user_role_enum" AS ENUM ('ADMIN', 'DOCTOR', 'PHARMACIST', 'PARENT', 'PATIENT')
        `);

    // Users table
    await queryRunner.query(`
            CREATE TABLE "users" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "phone" character varying NOT NULL,
                "name" character varying,
                "gender" character varying,
                "password_hash" character varying NOT NULL,
                "refresh_token_hash" character varying,
                "role" "user_role_enum" NOT NULL DEFAULT 'PATIENT',
                "license_number" character varying,
                "is_verified" boolean NOT NULL DEFAULT false,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "reset_password_otp" character varying,
                "reset_password_otp_expiry" TIMESTAMP,
                "parent_id" uuid,
                CONSTRAINT "UQ_users_phone" UNIQUE ("phone"),
                CONSTRAINT "PK_users_id" PRIMARY KEY ("id"),
                CONSTRAINT "FK_users_parent" FOREIGN KEY ("parent_id") REFERENCES "users"("id") ON DELETE SET NULL
            )
        `);

    // Create indexes for users
    await queryRunner.query(
      `CREATE INDEX "IDX_users_phone" ON "users" ("phone")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_users_role" ON "users" ("role")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_users_is_verified" ON "users" ("is_verified")`,
    );

    // Consultations table
    await queryRunner.query(`
            CREATE TABLE "consultations" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "patient_id" uuid NOT NULL,
                "doctor_id" uuid NOT NULL,
                "diagnosis" text,
                "prescription" text,
                "notes" text,
                "qr_token" character varying,
                "qr_expiry" TIMESTAMP,
                "is_dispensed" boolean NOT NULL DEFAULT false,
                "dispensed_at" TIMESTAMP,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_consultations_id" PRIMARY KEY ("id"),
                CONSTRAINT "FK_consultations_patient" FOREIGN KEY ("patient_id") REFERENCES "users"("id") ON DELETE CASCADE,
                CONSTRAINT "FK_consultations_doctor" FOREIGN KEY ("doctor_id") REFERENCES "users"("id") ON DELETE CASCADE
            )
        `);

    await queryRunner.query(
      `CREATE INDEX "IDX_consultations_patient" ON "consultations" ("patient_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_consultations_doctor" ON "consultations" ("doctor_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_consultations_created_at" ON "consultations" ("created_at")`,
    );

    // Vaccinations table
    await queryRunner.query(`
            CREATE TABLE "vaccinations" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "patient_id" uuid NOT NULL,
                "vaccine_name" character varying NOT NULL,
                "date_administered" TIMESTAMP NOT NULL,
                "next_dose_date" TIMESTAMP,
                "administered_by_id" uuid,
                "notes" text,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_vaccinations_id" PRIMARY KEY ("id"),
                CONSTRAINT "FK_vaccinations_patient" FOREIGN KEY ("patient_id") REFERENCES "users"("id") ON DELETE CASCADE,
                CONSTRAINT "FK_vaccinations_administered_by" FOREIGN KEY ("administered_by_id") REFERENCES "users"("id") ON DELETE SET NULL
            )
        `);

    await queryRunner.query(
      `CREATE INDEX "IDX_vaccinations_patient" ON "vaccinations" ("patient_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_vaccinations_next_dose" ON "vaccinations" ("next_dose_date")`,
    );

    // Epidemic reports table
    await queryRunner.query(`
            CREATE TABLE "epidemic_reports" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "doctor_id" uuid NOT NULL,
                "disease_name" character varying NOT NULL,
                "cases_count" integer NOT NULL DEFAULT 1,
                "location" character varying,
                "symptoms" text,
                "severity" character varying,
                "status" character varying DEFAULT 'pending',
                "reported_at" TIMESTAMP NOT NULL DEFAULT now(),
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_epidemic_reports_id" PRIMARY KEY ("id"),
                CONSTRAINT "FK_epidemic_reports_doctor" FOREIGN KEY ("doctor_id") REFERENCES "users"("id") ON DELETE CASCADE
            )
        `);

    await queryRunner.query(
      `CREATE INDEX "IDX_epidemic_reports_doctor" ON "epidemic_reports" ("doctor_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_epidemic_reports_status" ON "epidemic_reports" ("status")`,
    );

    // Messages table
    await queryRunner.query(`
            CREATE TABLE "messages" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "sender_id" uuid NOT NULL,
                "receiver_id" uuid NOT NULL,
                "content" text NOT NULL,
                "is_read" boolean NOT NULL DEFAULT false,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_messages_id" PRIMARY KEY ("id"),
                CONSTRAINT "FK_messages_sender" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE CASCADE,
                CONSTRAINT "FK_messages_receiver" FOREIGN KEY ("receiver_id") REFERENCES "users"("id") ON DELETE CASCADE
            )
        `);

    await queryRunner.query(
      `CREATE INDEX "IDX_messages_sender" ON "messages" ("sender_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_messages_receiver" ON "messages" ("receiver_id")`,
    );

    // Notifications table
    await queryRunner.query(`
            CREATE TABLE "notifications" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "user_id" uuid NOT NULL,
                "title" character varying NOT NULL,
                "content" text NOT NULL,
                "type" character varying NOT NULL,
                "metadata" jsonb,
                "is_read" boolean NOT NULL DEFAULT false,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_notifications_id" PRIMARY KEY ("id"),
                CONSTRAINT "FK_notifications_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
            )
        `);

    await queryRunner.query(
      `CREATE INDEX "IDX_notifications_user" ON "notifications" ("user_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_notifications_is_read" ON "notifications" ("is_read")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "notifications"`);
    await queryRunner.query(`DROP TABLE "messages"`);
    await queryRunner.query(`DROP TABLE "epidemic_reports"`);
    await queryRunner.query(`DROP TABLE "vaccinations"`);
    await queryRunner.query(`DROP TABLE "consultations"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "user_role_enum"`);
  }
}
