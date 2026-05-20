import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
} from "typeorm";
import { Consultation } from "./consultation.entity";

export enum ItemStatus {
  PENDING = "PENDING",
  DISPENSED = "DISPENSED",
  UNAVAILABLE = "UNAVAILABLE",
}

@Entity("prescription_items")
export class PrescriptionItem {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => Consultation, { onDelete: "CASCADE" })
  consultation: Consultation;

  @Column()
  medicineName: string;

  @Column({ nullable: true })
  dosage: string;

  @Column({ type: "int", default: 1 })
  quantity: number;

  @Column({ nullable: true })
  timeOfDay: string;

  @Column({ type: "text", default: "PENDING" })
  status: string;

  @CreateDateColumn()
  createdAt: Date;
}
