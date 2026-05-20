import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
} from "typeorm";
import { User } from "../../users/entities/user.entity";

@Entity("emergencies")
export class Emergency {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => User)
  caller: User;

  @Column({ type: "text" })
  description: string;

  @Column({ type: "text", nullable: true })
  latitude: string;

  @Column({ type: "text", nullable: true })
  longitude: string;

  @Column({ type: "text", nullable: true })
  address: string;

  @Column({ type: "text", default: "PENDING" })
  status: "PENDING" | "ACKNOWLEDGED" | "RESOLVED" | "CANCELLED";

  @Column({ type: "text", nullable: true })
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

  @Column({ type: "text", nullable: true })
  serviceType: string; // 'AMBULANCE', 'FIRE', 'POLICE', 'MEDICAL'

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
  acknowledgedAt: Date;

  @Column({ nullable: true })
  resolvedAt: Date;

  @Column({ type: "text", nullable: true })
  notes: string;
}
