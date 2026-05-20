import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from "@nestjs/common";
import { UsersService } from "../users/users.service";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { TelecomService } from "../telecom/telecom.service";
import { AppConfigService } from "../config/app-config.service";
import { UserRole } from "../users/entities/user.entity";
import { TotpService } from "../common/totp.service";

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private telecomService: TelecomService,
    private config: AppConfigService,
    private totpService: TotpService,
  ) {}

  async register(registerDto: any) {
    const existingUser = await this.usersService.findOneByPhone(
      registerDto.phone,
    );

    if (existingUser) {
      // Allow OTP-created users (no name set) to complete registration
      if (!existingUser.name) {
        const passwordHash = await bcrypt.hash(registerDto.password, 10);
        const roles = registerDto.roles?.length
          ? registerDto.roles
          : [registerDto.role || UserRole.PATIENT];

        await this.usersService.update(existingUser.id, {
          passwordHash,
          name: registerDto.name || null,
          gender: registerDto.gender || null,
          bloodGroup: registerDto.bloodGroup || null,
          roles,
          activeRole: roles[0] as UserRole,
          licenseNumber: registerDto.licenseNumber || null,
          isVerified: roles.every(
            (r) => r === UserRole.PATIENT || r === UserRole.PARENT,
          )
            ? this.config.enableAutoVerification
            : false,
        });

        const updated = await this.usersService.findById(existingUser.id);
        return this.login(updated);
      }

      throw new ConflictException("Ce numéro est déjà enregistré.");
    }

    const passwordHash = await bcrypt.hash(registerDto.password, 10);

    const roles = registerDto.roles?.length
      ? registerDto.roles
      : [registerDto.role || UserRole.PATIENT];
    const newUser = await this.usersService.create({
      phone: registerDto.phone,
      passwordHash,
      name: registerDto.name || null,
      gender: registerDto.gender || null,
      bloodGroup: registerDto.bloodGroup || null,
      roles,
      activeRole: roles[0],
      licenseNumber: registerDto.licenseNumber || null,
      isVerified: roles.every(
        (r) => r === UserRole.PATIENT || r === UserRole.PARENT,
      )
        ? this.config.enableAutoVerification
        : false,
    });

    return this.login(newUser);
  }

  async validateUser(phone: string, pass: string): Promise<any> {
    const user =
      await this.usersService.findOneByPhoneWithSecurityFields(phone);
    if (user && (await bcrypt.compare(pass, user.passwordHash))) {
      const { passwordHash, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    if (user.is2FAEnabled) {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiry = new Date();
      expiry.setMinutes(expiry.getMinutes() + 5);

      await this.usersService.update(user.id, {
        twoFAOTP: otp,
        twoFAOTPExpiry: expiry,
      });

      await this.telecomService.sendSms(
        user.phone,
        `[FasoCare] Votre code de sécurité 2FA est : ${otp}. Valide 5 mins.`,
      );

      return {
        require2FA: true,
        userId: user.id,
        message: "Un code 2FA a été envoyé par SMS.",
      };
    }

    return this.generateTokensForUser(user);
  }

  private async generateTokensForUser(user: any) {
    const roles = user.roles || [user.role || UserRole.PATIENT];
    const activeRole = user.activeRole || roles[0];
    const payload = {
      phone: user.phone,
      sub: user.id,
      roles,
      role: activeRole,
      activeRole,
      isVerified: user.isVerified !== false,
    };
    const tokens = await this.getTokens(payload);
    await this.updateRefreshToken(user.id, tokens.refresh_token);

    // Return tokens AND user profile (sans sensible data)
    const {
      passwordHash,
      refreshTokenHash,
      resetPasswordOTP,
      twoFAOTP,
      ...userProfile
    } = user;
    return {
      ...tokens,
      user: userProfile,
    };
  }

  async verify2FA(userId: string, otp: string) {
    const user = await this.usersService.findByIdWithSecurityFields(userId);
    if (!user || user.twoFAOTP !== otp) {
      throw new UnauthorizedException("Code 2FA invalide");
    }

    if (new Date() > user.twoFAOTPExpiry) {
      throw new UnauthorizedException("Code 2FA expiré");
    }

    // Clear OTP after successful verification
    await this.usersService.update(userId, {
      twoFAOTP: null,
      twoFAOTPExpiry: null,
    });

    return this.generateTokensForUser(user);
  }

  async refreshToken(userId: string, refreshToken: string) {
    const user = await this.usersService.findByIdWithSecurityFields(userId);
    if (!user || !user.refreshTokenHash) {
      throw new UnauthorizedException("Accès refusé");
    }

    const refreshTokenMatches = await bcrypt.compare(
      refreshToken,
      user.refreshTokenHash,
    );
    if (!refreshTokenMatches) {
      throw new UnauthorizedException("Token invalide");
    }

    const roles = user.roles?.length ? user.roles : [UserRole.PATIENT];
    const tokens = await this.getTokens({
      phone: user.phone,
      sub: user.id,
      roles,
      role: user.activeRole || roles[0],
      activeRole: user.activeRole || roles[0],
      isVerified: user.isVerified !== false,
    });
    await this.updateRefreshToken(user.id, tokens.refresh_token);
    return tokens;
  }

  async refreshTokenFromRaw(refreshToken: string) {
    let payload: any;
    try {
      payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.config.jwtRefreshSecret,
      });
    } catch {
      throw new UnauthorizedException("Refresh token invalide");
    }

    if (!payload?.sub) {
      throw new UnauthorizedException("Refresh token invalide");
    }

    return this.refreshToken(payload.sub, refreshToken);
  }

  async logout(userId: string) {
    await this.usersService.update(userId, { refreshTokenHash: null });
  }

  private async getTokens(payload: any) {
    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.config.jwtSecret,
        expiresIn: this.config.jwtAccessExpiration as any,
      }),
      this.jwtService.signAsync(payload, {
        secret: this.config.jwtRefreshSecret,
        expiresIn: this.config.jwtRefreshExpiration as any,
      }),
    ]);

    return {
      access_token: at,
      refresh_token: rt,
    };
  }

  private async updateRefreshToken(userId: string, refreshToken: string) {
    const hash = await bcrypt.hash(refreshToken, 10);
    await this.usersService.update(userId, { refreshTokenHash: hash });
  }

  async forgotPassword(phone: string) {
    const user =
      await this.usersService.findOneByPhoneWithSecurityFields(phone);
    if (!user) return { message: "Si le numéro existe, un SMS sera envoyé." };

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + 15);

    await this.usersService.update(user.id, {
      resetPasswordOTP: otp,
      resetPasswordOTPExpiry: expiry,
    });

    await this.telecomService.sendSms(
      phone,
      `[FasoCare] Votre code de réinitialisation est : ${otp}. Valide 15 mins.`,
    );

    return { message: "SMS envoyé." };
  }

  async resetPassword(phone: string, otp: string, newPass: string) {
    const user =
      await this.usersService.findOneByPhoneWithSecurityFields(phone);
    if (!user || user.resetPasswordOTP !== otp) {
      throw new UnauthorizedException("Code invalide ou utilisateur inconnu");
    }

    if (new Date() > user.resetPasswordOTPExpiry) {
      throw new UnauthorizedException("Code expiré");
    }

    const passwordHash = await bcrypt.hash(newPass, 10);
    await this.usersService.update(user.id, {
      passwordHash,
      resetPasswordOTP: null,
      resetPasswordOTPExpiry: null,
    });

    return { message: "Mot de passe mis à jour." };
  }

  /**
   * Find existing user or create new one by phone number
   * Used for OTP-based login (passwordless)
   */
  async findOrCreateUserByPhone(phone: string) {
    let user = await this.usersService.findOneByPhone(phone);

    if (!user) {
      // Create new user with default PATIENT role
      const randomPassword = Math.random().toString(36).slice(-32);
      const passwordHash = await bcrypt.hash(randomPassword, 10);

      user = await this.usersService.create({
        phone,
        passwordHash,
        roles: [UserRole.PATIENT],
        activeRole: UserRole.PATIENT,
        isVerified: true,
        name: null,
        gender: null,
        licenseNumber: null,
      });
    }

    return user;
  }

  async switchRole(userId: string, newRole: string) {
    const user = await this.usersService.findById(userId);
    const roles = user.roles?.length ? user.roles : [UserRole.PATIENT];
    const role = newRole as UserRole;

    if (!roles.includes(role)) {
      throw new UnauthorizedException("Vous ne possédez pas ce rôle.");
    }

    return this.generateTokensForUser({ ...user, activeRole: role, roles });
  }

  async setupTOTP(userId: string) {
    const user = await this.usersService.findByIdWithSecurityFields(userId);
    if (!user) throw new UnauthorizedException("Utilisateur non trouvé");

    const secret = this.totpService.generateSecret();
    const backupCodes = this.totpService.generateBackupCodes(8);
    const uri = this.totpService.getProvisioningUri(secret, userId);

    await this.usersService.update(userId, {
      totpSecret: secret,
      backupCodes,
    } as any);

    return { secret, uri, backupCodes };
  }

  async verifyAndEnableTOTP(userId: string, token: string) {
    const user = await this.usersService.findByIdWithSecurityFields(userId);
    if (!user || !user.totpSecret)
      throw new BadRequestException("TOTP non configuré");

    if (!this.totpService.verifyTOTP(token, user.totpSecret)) {
      throw new UnauthorizedException("Code invalide");
    }

    await this.usersService.update(userId, { is2FAEnabled: true } as any);
    return { message: "2FA TOTP activé avec succès" };
  }

  async disableTOTP(userId: string, token: string) {
    const user = await this.usersService.findByIdWithSecurityFields(userId);
    if (!user || !user.totpSecret)
      throw new BadRequestException("TOTP non configuré");

    if (!this.totpService.verifyTOTP(token, user.totpSecret)) {
      throw new UnauthorizedException("Code invalide");
    }

    await this.usersService.update(userId, {
      is2FAEnabled: false,
      totpSecret: null,
      backupCodes: null,
    } as any);
    return { message: "2FA TOTP désactivé" };
  }

  async loginWithBackupCode(userId: string, code: string) {
    const user = await this.usersService.findByIdWithSecurityFields(userId);
    if (!user || !user.backupCodes)
      throw new UnauthorizedException("Aucun code de secours");

    const codes = Array.isArray(user.backupCodes)
      ? user.backupCodes
      : [user.backupCodes];
    const idx = codes.indexOf(code.toUpperCase());
    if (idx === -1) throw new UnauthorizedException("Code de secours invalide");

    codes.splice(idx, 1);
    await this.usersService.update(userId, { backupCodes: codes } as any);
    return this.generateTokensForUser(user);
  }
}
