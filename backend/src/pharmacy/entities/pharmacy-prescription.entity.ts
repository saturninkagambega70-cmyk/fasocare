import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
} from "typeorm";
import { Pharmacy } from "./pharmacy.entity";
import { User } from "../../users/entities/user.entity";

@Entity("pharmacy_prescriptions")
export class PharmacyPrescription {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => Pharmacy)
  pharmacy: Pharmacy;

  @Column()
  consultationId: string;

  @ManyToOne(() => User)
  pharmacist: User;

  @Column({ nullable: true })
  medicineName: string;

  @Column({ type: "int", default: 0 })
  quantityDispensed: number;

  @CreateDateColumn()
  dispensedAt: Date;

  @Column({ nullable: true })
  pharmacyName: string;

  @Column({ nullable: true })
  pharmacyPhone: string;

  @Column({ nullable: true })
  pharmacistName: string;

  @Column({ nullable: true })
  pharmacistLicense: string;

  @Column({ nullable: true })
  cachetSignature: string;

  @Column({ nullable: true })
  cachetToken: string;
}
