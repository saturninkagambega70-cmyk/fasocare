import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from "typeorm";
import { Consultation } from "./consultation.entity";
import { PrescriptionItem } from "./prescription-item.entity";
import { User } from "../../users/entities/user.entity";

export enum TreatmentLogStatus {
  TAKEN = "TAKEN",
  SKIPPED = "SKIPPED",
  CONFIRMED = "CONFIRMED",
}

@Entity("treatment_logs")
export class TreatmentLog {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => Consultation)
  consultation: Consultation;

  @ManyToOne(() => PrescriptionItem)
  item: PrescriptionItem;

  @ManyToOne(() => User)
  patient: User;

  @Column()
  scheduledTime: string;

  @Column({ type: "datetime", nullable: true })
  takenAt: Date;

  @Column({ type: "varchar", default: TreatmentLogStatus.TAKEN })
  status: TreatmentLogStatus;

  @ManyToOne(() => User, { nullable: true })
  confirmedBy: User;

  @Column({ type: "datetime", nullable: true })
  confirmedAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
