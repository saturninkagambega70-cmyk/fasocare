import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "./entities/user.entity";
import { AppConfigService } from "../config/app-config.service";
import * as CryptoJS from "crypto-js";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private configService: AppConfigService,
  ) {}

  private cleanPhone(phone: string): string {
    if (!phone) return "";
    // On retire tout sauf les chiffres, et on prend les 8 derniers (Burkina)
    const digits = phone.replace(/\D/g, "");
    return digits.length > 8 ? digits.slice(-8) : digits;
  }

  private buildPhoneHash(phone: string): string {
    const key = this.configService.encryptionKey;
    if (!key) {
      throw new Error("ENCRYPTION_KEY is required");
    }
    return CryptoJS.SHA256(phone + key).toString();
  }

  async findOneByPhone(phone: string): Promise<User | undefined> {
    const sanitized = this.cleanPhone(phone);
    const phoneHash = this.buildPhoneHash(sanitized);
    return this.userRepository
      .createQueryBuilder("user")
      .where("user.phone_hash = :phoneHash", { phoneHash })
      .getOne();
  }

  async findById(id: string): Promise<User | undefined> {
    return this.userRepository.findOne({ where: { id } });
  }

  async findByIdWithSecurityFields(id: string): Promise<User | undefined> {
    return this.userRepository
      .createQueryBuilder("user")
      .addSelect([
        "user.refreshTokenHash",
        "user.resetPasswordOTP",
        "user.resetPasswordOTPExpiry",
        "user.twoFAOTP",
        "user.twoFAOTPExpiry",
      ])
      .where("user.id = :id", { id })
      .getOne();
  }

  async findOneByPhoneWithSecurityFields(
    phone: string,
  ): Promise<User | undefined> {
    const sanitized = this.cleanPhone(phone);
    const phoneHash = this.buildPhoneHash(sanitized);
    return this.userRepository
      .createQueryBuilder("user")
      .addSelect([
        "user.refreshTokenHash",
        "user.resetPasswordOTP",
        "user.resetPasswordOTPExpiry",
        "user.twoFAOTP",
        "user.twoFAOTPExpiry",
      ])
      .where("user.phone_hash = :phoneHash", { phoneHash })
      .getOne();
  }

  async update(id: string, updateData: Partial<User>): Promise<void> {
    if (updateData.phone) updateData.phone = this.cleanPhone(updateData.phone);
    await this.userRepository.update(id, updateData);
  }

  async create(user: Partial<User>): Promise<User> {
    if (user.phone) user.phone = this.cleanPhone(user.phone);
    const newUser = this.userRepository.create(user);
    return this.userRepository.save(newUser);
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findChildren(parentId: string): Promise<User[]> {
    return this.userRepository.find({
      where: { parent: { id: parentId } },
    });
  }

  async isChildOfParent(parentId: string, childId: string): Promise<boolean> {
    const child = await this.userRepository.findOne({
      where: { id: childId, parent: { id: parentId } },
    });
    return !!child;
  }

  async addChild(parentId: string, childId: string): Promise<void> {
    await this.userRepository.update(childId, { parent: { id: parentId } });
  }

  async anonymize(id: string): Promise<void> {
    const user = await this.findById(id);
    if (!user) return;

    const anonPhone = (Date.now().toString() + id.replace(/\D/g, "")).slice(-8);
    const phoneHash = this.buildPhoneHash(anonPhone);

    await this.userRepository.update(id, {
      name: "ANONYMOUS",
      phone: anonPhone,
      phoneHash,
      licenseNumber: null,
      isVerified: false,
      refreshTokenHash: null,
      is2FAEnabled: false,
    });
  }

  async count(): Promise<number> {
    return this.userRepository.count();
  }
}
