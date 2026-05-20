import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
} from "typeorm";
import { User } from "../../users/entities/user.entity";

@Entity("pharmacies")
export class Pharmacy {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  location: string; // GPS Coordinates format: "lat,lng"

  @Column()
  phone: string;

  @Column({ nullable: true })
  openingHours: string; // JSON: {"monday":"07:00-20:00","tuesday":"07:00-20:00",...}

  @Column({ default: true })
  isOpen: boolean; // Manual override

  @ManyToOne(() => User)
  admin: User; // The pharmacist managing this pharmacy

  @CreateDateColumn()
  createdAt: Date;
}
