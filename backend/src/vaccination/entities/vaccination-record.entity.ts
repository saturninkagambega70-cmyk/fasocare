import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
} from "typeorm";
import { User } from "../../users/entities/user.entity";
import { EncryptionTransformer } from "../../common/encryption/encryption.transformer";

@Entity("vaccinations")
export class VaccinationRecord {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => User)
  patient: User;

  @Column()
  vaccineName: string;

  @Column({ type: "date" })
  dateAdministered: Date;

  @Column({ type: "date", nullable: true })
  nextDoseDate: Date;

  @Column({
    nullable: true,
    transformer: new EncryptionTransformer(),
  })
  batchNumber: string;

  @Column({ type: "varchar", nullable: true })
  location: string;

  @Column({ default: false })
  reminderSent: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
