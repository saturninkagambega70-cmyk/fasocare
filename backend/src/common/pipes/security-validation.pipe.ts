import { ValidationPipe, BadRequestException } from "@nestjs/common";

/**
 * Enhanced validation pipe with security-focused error messages
 */
export const securityValidationPipe = new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
  transformOptions: { enableImplicitConversion: true },
  exceptionFactory: (errors) => {
    // Sanitize error messages to prevent information leakage
    const sanitizedErrors = errors.map((error) => ({
      field: error.property,
      message: "Invalid value provided",
    }));
    return new BadRequestException(sanitizedErrors);
  },
});
