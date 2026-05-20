import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  BeforeInsert,
  BeforeUpdate,
} from "typeorm";
import * as CryptoJS from "crypto-js";
import { EncryptionTransformer } from "../../common/encryption/encryption.transformer";

export enum UserRole {
  ADMIN = "ADMIN",
  DOCTOR = "DOCTOR",
  PHARMACIST = "PHARMACIST",
  PARENT = "PARENT",
  PATIENT = "PATIENT",
  HEALTH_MINISTRY = "HEALTH_MINISTRY",
  INSPECTOR = "INSPECTOR",
  LEGAL_AUTHORITY = "LEGAL_AUTHORITY",
  LAB_TECHNICIAN = "LAB_TECHNICIAN",
}

/**
 * Entité User avec chiffrement PII
 * Données sensibles: name, phone
 * Le téléphone est aussi stocké en hash pour recherche
 */
@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => User, (user) => user.children, { nullable: true })
  parent: User;

  @OneToMany(() => User, (user) => user.parent)
  children: User[];

  @Column({
    name: "phone",
    unique: true,
    transformer: new EncryptionTransformer(),
  })
  phone: string;

  // Hash du téléphone pour recherche (doublons, login)
  @Column({ name: "phone_hash", unique: true, select: false, nullable: true })
  phoneHash: string;

  @Column({
    name: "name",
    nullable: true,
    transformer: new EncryptionTransformer(),
  })
  name: string;

  @Column({ nullable: true })
  gender: string; // M, F

  @Column({ nullable: true })
  bloodGroup: string; // A+, A-, B+, B-, AB+, AB-, O+, O-

  @Column()
  passwordHash: string;

  @Column({ name: "refresh_token_hash", nullable: true, select: false })
  refreshTokenHash: string;

  @Column("simple-array", { default: UserRole.PATIENT })
  roles: UserRole[];

  @Column({ type: "varchar", nullable: true })
  activeRole: UserRole;

  @Column({ nullable: true })
  licenseNumber: string;

  @Column({ type: "text", nullable: true })
  publicKey: string;

  @Column({ default: false })
  isVerified: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ name: "reset_password_otp", nullable: true, select: false })
  resetPasswordOTP: string;

  @Column({ name: "reset_password_otp_expiry", nullable: true, select: false })
  resetPasswordOTPExpiry: Date;

  @Column({ name: "is_2fa_enabled", default: false })
  is2FAEnabled: boolean;

  @Column({ name: "two_fa_otp", nullable: true, select: false })
  twoFAOTP: string;

  @Column({ name: "two_fa_otp_expiry", nullable: true, select: false })
  twoFAOTPExpiry: Date;

  @Column({ name: "totp_secret", nullable: true, select: false })
  totpSecret: string;

  @Column("simple-array", { name: "backup_codes", nullable: true })
  backupCodes: string[];

  // Hash du téléphone avant sauvegarde
  @BeforeInsert()
  @BeforeUpdate()
  hashFields() {
    if (this.phone) {
      const encryptionKey = process.env.ENCRYPTION_KEY;
      if (!encryptionKey) {
        throw new Error("ENCRYPTION_KEY is required");
      }
      this.phoneHash = CryptoJS.SHA256(this.phone + encryptionKey).toString();
    }
  }
}
