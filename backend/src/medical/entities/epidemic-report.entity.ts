import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
} from "typeorm";
import { User } from "../../users/entities/user.entity";
import { EncryptionTransformer } from "../../common/encryption/encryption.transformer";

@Entity("epidemic_reports")
export class EpidemicReport {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => User)
  doctor: User;

  @Column()
  disease: string;

  @Column()
  casesCount: number;

  @Column()
  location: string;

  @Column({
    type: "text",
    nullable: true,
    transformer: new EncryptionTransformer(),
  })
  notes: string;

  @Column({ default: "SUBMITTED" }) // SUBMITTED, REVIEWED, ACTION_TAKEN
  status: string;

  @CreateDateColumn()
  createdAt: Date;
}
