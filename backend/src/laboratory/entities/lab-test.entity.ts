import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  UpdateDateColumn,
} from "typeorm";
import { User } from "../../users/entities/user.entity";
import { EncryptionTransformer } from "../../common/encryption/encryption.transformer";

export enum LabTestStatus {
  PENDING = "PENDING",
  COLLECTED = "COLLECTED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

@Entity("lab_tests")
export class LabTest {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => User)
  patient: User;

  @ManyToOne(() => User)
  prescribedBy: User;

  @ManyToOne(() => User, { nullable: true })
  performedBy: User;

  @Column()
  testName: string;

  @Column({ nullable: true })
  category: string; // e.g. Hematology, Microbiology

  @Column({
    type: "text",
    nullable: true,
    transformer: new EncryptionTransformer(),
  })
  resultValue: string;

  @Column({
    type: "text",
    nullable: true,
    transformer: new EncryptionTransformer(),
  })
  notes: string;

  @Column({
    type: "varchar",
    enum: LabTestStatus,
    default: LabTestStatus.PENDING,
  })
  status: LabTestStatus;

  @Column({ nullable: true })
  resultDate: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
