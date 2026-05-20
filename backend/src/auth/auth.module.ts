import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { UsersModule } from "../users/users.module";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";
import { AuthController } from "./auth.controller";
import { JwtStrategy } from "./jwt.strategy";

import { TelecomModule } from "../telecom/telecom.module";
import { AppConfigModule } from "../config/app-config.module";
import { AppConfigService } from "../config/app-config.service";
import { TotpService } from "../common/totp.service";

@Module({
  imports: [
    UsersModule,
    TelecomModule,
    AppConfigModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [AppConfigModule],
      useFactory: (config: AppConfigService) => ({
        secret: config.jwtSecret,
        signOptions: {
          expiresIn: config.jwtAccessExpiration as any,
        },
      }),
      inject: [AppConfigService],
    }),
  ],
  providers: [AuthService, JwtStrategy, TotpService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
