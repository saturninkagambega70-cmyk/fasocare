import {
  Controller,
  Post,
  Body,
  Logger,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { UssdService } from "./ussd.service";

@Controller("ussd")
export class UssdController {
  private readonly logger = new Logger(UssdController.name);

  constructor(private readonly ussdService: UssdService) {}

  private errorMessage(error: unknown): string {
    return error instanceof Error ? error.message : "Erreur interne";
  }

  /**
   * Africa's Talking Callback Handler
   * POST request from AT when user sends USSD
   *
   * Request Format:
   * {
   *   "phoneNumber": "+226XXXXXXXX",
   *   "text": "1*1*1" or "" (empty for initial request),
   *   "sessionId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
   *   "serviceCode": "201",
   *   "networkCode": "63902"
   * }
   *
   * Response Format:
   * "CON Message" (continue session) or
   * "END Message" (end session)
   */
  @Post("callback")
  @HttpCode(HttpStatus.OK)
  async handleUssd(
    @Body()
    body: {
      phoneNumber: string;
      text: string;
      sessionId: string;
      serviceCode: string;
      networkCode?: string;
    },
  ): Promise<{ message: string }> {
    const { phoneNumber, text, sessionId } = body;

    this.logger.debug(
      `USSD Request: Phone=${phoneNumber}, Text="${text}", SessionId=${sessionId}`,
    );

    try {
      const response = await this.ussdService.processUssd(
        phoneNumber,
        text,
        sessionId,
      );

      this.logger.debug(`USSD Response: ${response}`);

      return {
        message: response,
      };
    } catch (error: unknown) {
      const message = this.errorMessage(error);
      const stack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`USSD Error: ${message}`, stack);
      return {
        message: "END Erreur système. Veuillez réessayer plus tard.",
      };
    }
  }

  /**
   * Test USSD endpoint (for development)
   * POST /ussd/test
   * {
   *   "phoneNumber": "+226XX123456",
   *   "text": "" or "1" or "1*1",
   *   "sessionId": "test-session-123"
   * }
   */
  @Post("test")
  @HttpCode(HttpStatus.OK)
  async testUssd(
    @Body()
    body: {
      phoneNumber: string;
      text?: string;
      sessionId?: string;
    },
  ): Promise<{ message: string }> {
    const { phoneNumber, text = "", sessionId = `test-${Date.now()}` } = body;

    this.logger.log(`Test USSD: Phone=${phoneNumber}, Text="${text}"`);

    try {
      const response = await this.ussdService.processUssd(
        phoneNumber,
        text,
        sessionId,
      );
      return {
        message: response,
      };
    } catch (error: unknown) {
      const message = this.errorMessage(error);
      this.logger.error(`Test USSD Error: ${message}`);
      return {
        message: "END Erreur de test.",
      };
    }
  }
}
