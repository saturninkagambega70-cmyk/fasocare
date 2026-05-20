import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  UpdateDateColumn,
} from "typeorm";
import { User } from "../../users/entities/user.entity";

@Entity("consents")
export class Consent {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => User)
  patient: User;

  @Column()
  consentType: string; // e.g., 'DATA_SHARING', 'VACCINATION', 'RESEARCH'

  @Column({ default: false })
  isGranted: boolean;

  @Column({ nullable: true })
  grantedAt: Date;

  @Column({ nullable: true })
  revokedAt: Date;

  @Column({ type: "text", nullable: true })
  ipAddress: string;

  @Column({ type: "text", nullable: true })
  userAgent: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
