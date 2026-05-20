import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { User } from "../../users/entities/user.entity";
import { EncryptionTransformer } from "../../common/encryption/encryption.transformer";
import { PrescriptionItem } from "./prescription-item.entity";

@Entity("consultations")
export class Consultation {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => User)
  patient: User;

  @ManyToOne(() => User)
  doctor: User;

  @Column({
    type: "text",
    transformer: new EncryptionTransformer(),
  })
  diagnosis: string;

  @Column({
    type: "text",
    nullable: true,
    transformer: new EncryptionTransformer(),
  })
  treatmentPlan: string;

  @Column({ type: "float", nullable: true })
  temperature: number;

  @Column({ type: "float", nullable: true })
  weight: number;

  @Column({ type: "int", nullable: true })
  pulse: number;

  @Column({
    type: "text",
    nullable: true,
    transformer: new EncryptionTransformer(),
  })
  bloodPressure: string;

  @Column({ type: "text", default: "NORMAL" })
  urgencyLevel: string;

  @Column({ type: "text", nullable: true })
  hospital: string;

  @Column({
    type: "simple-json",
    nullable: true,
    transformer: new EncryptionTransformer(),
  })
  prescription: any;

  @Column({ type: "boolean", default: false })
  isDispensed: boolean;

  @Column({ nullable: true })
  dispensedAt: Date;

  @Column({ unique: true, nullable: true })
  qr_token: string;

  @Column({ nullable: true })
  qr_expiry: Date;

  @OneToMany(() => PrescriptionItem, (item) => item.consultation)
  items: PrescriptionItem[];

  @CreateDateColumn()
  createdAt: Date;
}
