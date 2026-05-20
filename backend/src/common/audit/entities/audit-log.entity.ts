import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
} from "typeorm";
import { User } from "../../../users/entities/user.entity";

@Entity("audit_logs")
export class AuditLog {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => User, { nullable: true })
  user: User;

  @Column({ name: "user_id", nullable: true })
  userId: string;

  @Column()
  action: string; // e.g., 'CREATE', 'UPDATE', 'DELETE', 'LOGIN'

  @Column()
  resource: string; // e.g., 'Consultation', 'User'

  @Column({ name: "resource_id", nullable: true })
  resourceId: string;

  @Column({ type: "simple-json", nullable: true })
  payload: any;

  @Column({ name: "ip_address", nullable: true })
  ipAddress: string;

  @Column({ name: "user_agent", nullable: true })
  userAgent: string;

  @CreateDateColumn()
  timestamp: Date;
}
