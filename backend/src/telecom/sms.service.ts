import { Injectable, Logger } from "@nestjs/common";
import { TelecomService } from "./telecom.service";

export interface SmsResponse {
  status: string;
  [key: string]: any;
}

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  constructor(private readonly telecomService: TelecomService) {}

  async send(
    recipients: string | string[],
    message: string,
  ): Promise<SmsResponse> {
    const recipientList = Array.isArray(recipients) ? recipients : [recipients];
    let lastResult: SmsResponse = { status: "FAILED" };

    for (const recipient of recipientList) {
      try {
        const result = await this.telecomService.sendSms(recipient, message);
        lastResult = (result || { status: "FAILED" }) as SmsResponse;
      } catch (error) {
        this.logger.error(`SMS send failed for ${recipient?.slice(0, 4)}****`);
        lastResult = { status: "FAILED" };
      }
    }

    return lastResult;
  }

  async sendOtp(phoneNumber: string, code: string): Promise<void> {
    const message = `Votre code de vérification FasoCare est: ${code}\nCode valide 10 minutes.\nNe le partagez avec personne.`;
    await this.send(phoneNumber, message);
  }

  async sendAppointmentConfirmation(
    phoneNumber: string,
    data: {
      referenceCode: string;
      facilityName: string;
      date: string;
      time?: string;
    },
  ): Promise<void> {
    const message = `RDV CONFIRME - FasoCare\n\nReference: ${data.referenceCode}\nEtablissement: ${data.facilityName}\nDate: ${data.date}${data.time ? `\nHeure: ${data.time}` : ""}`;
    await this.send(phoneNumber, message);
  }

  async sendHealthAlert(
    phoneNumber: string,
    data: { title: string; message: string; actionUrl?: string },
  ): Promise<void> {
    const fullMessage = `${data.title}\n\n${data.message}${data.actionUrl ? `\n\nPlus d'informations: ${data.actionUrl}` : ""}`;
    await this.send(phoneNumber, fullMessage);
  }

  async broadcast(recipients: string[], message: string): Promise<SmsResponse> {
    this.logger.log(`Broadcast SMS to ${recipients.length} recipients`);
    return this.send(recipients, message);
  }
}
