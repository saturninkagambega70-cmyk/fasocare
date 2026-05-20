import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
} from "typeorm";
import { Pharmacy } from "./pharmacy.entity";

@Entity("medicine_stocks")
export class MedicineStock {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => Pharmacy)
  pharmacy: Pharmacy;

  @Column()
  medicineName: string;

  @Column({ type: "int", default: 0 })
  quantity: number;

  @Column({ type: "int", default: 10 })
  thresholdAlert: number;

  @Column({ type: "date", nullable: true })
  expiryDate: Date;

  @CreateDateColumn()
  createdAt: Date;
}
