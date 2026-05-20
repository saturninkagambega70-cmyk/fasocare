import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  UseGuards,
  Request,
  BadRequestException,
  Logger,
} from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { OtpService } from "../telecom/otp.service";
import { SmsService } from "../telecom/sms.service";

@Controller("auth")
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private authService: AuthService,
    private otpService: OtpService,
    private smsService: SmsService,
  ) {}

  private errorMessage(error: unknown): string {
    return error instanceof Error ? error.message : "Erreur interne";
  }

  @Post("login")
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(
      loginDto.phone,
      loginDto.password,
    );
    if (!user) {
      throw new UnauthorizedException("Identifiants invalides");
    }
    return this.authService.login(user);
  }

  /**
   * Request OTP for phone verification
   * POST /auth/request-otp
   * Body: { "phoneNumber": "+226XXXXXXXX" }
   */
  @Post("request-otp")
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  async requestOtp(@Body() body: { phoneNumber: string }) {
    try {
      const result = await this.otpService.generateAndSendOtp(
        body.phoneNumber,
        "PHONE_VERIFICATION",
      );

      // Send OTP via SMS
      await this.smsService.sendOtp(body.phoneNumber, result.code);

      this.logger.log(`OTP requested for phone: ${body.phoneNumber}`);

      return {
        statusCode: 201,
        success: true,
        message: "Code de vérification envoyé à votre téléphone",
        expiresIn: result.expiresIn,
      };
    } catch (error: unknown) {
      const message = this.errorMessage(error);
      this.logger.error(`OTP request error: ${message}`);
      throw new BadRequestException(message);
    }
  }

  /**
   * Verify OTP code
   * POST /auth/verify-otp
   * Body: { "phoneNumber": "+226XXXXXXXX", "code": "123456" }
   */
  @Post("verify-otp")
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async verifyOtp(@Body() body: { phoneNumber: string; code: string }) {
    try {
      const verified = await this.otpService.verifyOtp(
        body.phoneNumber,
        body.code,
        "PHONE_VERIFICATION",
      );

      if (!verified) {
        throw new UnauthorizedException("Code de vérification invalide");
      }

      this.logger.log(`OTP verified for phone: ${body.phoneNumber}`);

      // Generate JWT token for phone-verified user
      const user = await this.authService.findOrCreateUserByPhone(
        body.phoneNumber,
      );
      const tokens = await this.authService.login(user);

      return {
        statusCode: 200,
        success: true,
        message: "Téléphone vérifié avec succès",
        ...tokens,
      };
    } catch (error: unknown) {
      const message = this.errorMessage(error);
      this.logger.error(`OTP verification error: ${message}`);
      throw new BadRequestException(message);
    }
  }

  /**
   * Request OTP for login (passwordless)
   * POST /auth/request-login-otp
   * Body: { "phoneNumber": "+226XXXXXXXX" }
   */
  @Post("request-login-otp")
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  async requestLoginOtp(@Body() body: { phoneNumber: string }) {
    try {
      const result = await this.otpService.generateAndSendOtp(
        body.phoneNumber,
        "LOGIN",
      );

      // Send OTP via SMS
      await this.smsService.sendOtp(body.phoneNumber, result.code);

      this.logger.log(`Login OTP requested for phone: ${body.phoneNumber}`);

      return {
        statusCode: 201,
        success: true,
        message: "Code de connexion envoyé à votre téléphone",
        expiresIn: result.expiresIn,
      };
    } catch (error: unknown) {
      const message = this.errorMessage(error);
      this.logger.error(`Login OTP request error: ${message}`);
      throw new BadRequestException(message);
    }
  }

  /**
   * Login with OTP (passwordless)
   * POST /auth/login-otp
   * Body: { "phoneNumber": "+226XXXXXXXX", "code": "123456" }
   */
  @Post("login-otp")
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async loginWithOtp(@Body() body: { phoneNumber: string; code: string }) {
    try {
      const verified = await this.otpService.verifyOtp(
        body.phoneNumber,
        body.code,
        "LOGIN",
      );

      if (!verified) {
        throw new UnauthorizedException("Code de connexion invalide");
      }

      this.logger.log(`User logged in via OTP: ${body.phoneNumber}`);

      // Get or create user
      const user = await this.authService.findOrCreateUserByPhone(
        body.phoneNumber,
      );
      const tokens = await this.authService.login(user);

      return {
        statusCode: 200,
        success: true,
        message: "Connecté avec succès",
        ...tokens,
      };
    } catch (error: unknown) {
      const message = this.errorMessage(error);
      this.logger.error(`Login OTP error: ${message}`);
      throw new BadRequestException(message);
    }
  }

  @Post("verify-2fa")
  async verify2FA(@Body() body: { userId: string; otp: string }) {
    return this.authService.verify2FA(body.userId, body.otp);
  }

  @Post("totp/setup")
  @UseGuards(JwtAuthGuard)
  async setupTOTP(@Request() req: any) {
    return this.authService.setupTOTP(req.user.userId);
  }

  @Post("totp/verify")
  @UseGuards(JwtAuthGuard)
  async verifyTOTP(@Request() req: any, @Body() body: { token: string }) {
    return this.authService.verifyAndEnableTOTP(req.user.userId, body.token);
  }

  @Post("totp/disable")
  @UseGuards(JwtAuthGuard)
  async disableTOTP(@Request() req: any, @Body() body: { token: string }) {
    return this.authService.disableTOTP(req.user.userId, body.token);
  }

  @Post("totp/backup-login")
  async backupCodeLogin(@Body() body: { userId: string; code: string }) {
    return this.authService.loginWithBackupCode(body.userId, body.code);
  }

  @Post("register")
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post("refresh")
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async refresh(@Body() body: { refreshToken: string }) {
    return this.authService.refreshTokenFromRaw(body.refreshToken);
  }

  @Post("switch-role")
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async switchRole(@Request() req: any, @Body() body: { role: string }) {
    const user = await this.authService.switchRole(req.user.userId, body.role);
    return user;
  }

  @Post("logout")
  @UseGuards(JwtAuthGuard)
  async logout(@Request() req: any) {
    return this.authService.logout(req.user.userId);
  }

  @Post("forgot-password")
  async forgotPassword(@Body() body: { phone: string }) {
    return this.authService.forgotPassword(body.phone);
  }

  @Post("reset-password")
  async resetPassword(
    @Body() body: { phone: string; otp: string; newPass: string },
  ) {
    return this.authService.resetPassword(body.phone, body.otp, body.newPass);
  }
}
