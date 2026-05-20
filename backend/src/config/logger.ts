import { Logger } from "@nestjs/common";

/**
 * Lightweight logger wrapper to avoid optional external transports at build time.
 */
const baseLogger = new Logger("FasoCare");

export const logger = {
  error: (message: string, trace?: string, context?: string) =>
    baseLogger.error(message, trace, context),
  warn: (message: string, context?: string) =>
    baseLogger.warn(message, context),
  info: (message: string, context?: string) => baseLogger.log(message, context),
  http: (message: string, context?: string) => baseLogger.log(message, context),
  debug: (message: string, context?: string) =>
    baseLogger.debug(message, context),
};

export default logger;
