import { Module } from "@nestjs/common";
import { TelecomService } from "./telecom.service";
import { TelecomController } from "./telecom.controller";
import { OtpService } from "./otp.service";
import { SmsService } from "./sms.service";

@Module({
  imports: [],
  providers: [TelecomService, OtpService, SmsService],
  controllers: [TelecomController],
  exports: [TelecomService, OtpService, SmsService],
})
export class TelecomModule {}
