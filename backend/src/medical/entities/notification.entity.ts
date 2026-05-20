import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
} from "typeorm";
import { User } from "../../users/entities/user.entity";

export enum NotificationType {
  PRESCRIPTION = "PRESCRIPTION",
  VACCINATION = "VACCINATION",
  MESSAGE = "MESSAGE",
  SYSTEM = "SYSTEM",
}

@Entity("notifications")
export class Notification {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => User)
  user: User;

  @Column()
  title: string;

  @Column({ type: "text" })
  content: string;

  @Column({
    type: "varchar",
    enum: NotificationType,
    default: NotificationType.SYSTEM,
  })
  type: NotificationType;

  @Column({ default: false })
  isRead: boolean;

  @Column({ type: "simple-json", nullable: true })
  metadata: any;

  @CreateDateColumn()
  createdAt: Date;
}
