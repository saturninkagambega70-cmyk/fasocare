import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe, Logger } from "@nestjs/common";
import { AppConfigService } from "./config/app-config.service";
import helmet from "helmet";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";

async function bootstrap() {
  const logger = new Logger("Bootstrap");
  const app = await NestFactory.create(AppModule);

  const config = app.get(AppConfigService);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // CORS configuration from environment
  app.enableCors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Origin", "Accept"],
  });

  // Security headers with Helmet
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
        },
      },
      crossOriginEmbedderPolicy: false, // Required for some mobile clients
      crossOriginResourcePolicy: { policy: "cross-origin" },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
      noSniff: true,
      xssFilter: true,
      referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    }),
  );

  // API versioning prefix
  app.setGlobalPrefix("api/v1");

  // Swagger/OpenAPI Documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle("FasoCare National Health Platform API")
    .setDescription(
      "Plateforme Nationale de Santé Numérique du Burkina Faso\n\n" +
        "## Overview\n" +
        "Sovereign national digital health infrastructure.\n\n" +
        "## Key Features\n" +
        "- RBAC: Doctors, Pharmacists, Admin\n" +
        "- Encryption: PII Protection\n" +
        "- USSD: SMS/USSD for rural areas\n" +
        "- Audit Trail: Complete logging",
    )
    .setVersion("1.0.0")
    .setContact(
      "Agence Numérique de Santé (ANS)",
      "https://ans.bf",
      "contact@ans.bf",
    )
    .setLicense("Government License", "https://www.gouvernement.bf/")
    .addTag("Health", "Health checks")
    .addTag("Auth", "Authentication")
    .addTag("Users", "User management")
    .addTag("Medical", "Medical records")
    .addTag("Pharmacy", "Pharmacy services")
    .addTag("Laboratory", "Lab tests")
    .addTag("Vaccination", "Vaccination programs")
    .addTag("USSD", "USSD/SMS")
    .addBearerAuth(
      {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        name: "JWT",
        description: "Enter JWT token",
        in: "header",
      },
      "access-token",
    )
    .build();

  if (config.enableSwagger) {
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup("api/docs", app, document, {
      swaggerOptions: {
        persistAuthorization: false,
        displayOperationId: true,
        docExpansion: "list",
      },
    });
  }

  // Graceful shutdown
  app.enableShutdownHooks();

  await app.listen(config.port, config.host);
  logger.log(
    `[FasoCare Core] API: http://${config.host}:${config.port}/api/v1`,
  );
  if (config.enableSwagger) {
    logger.log(
      `📚 Swagger Docs: http://${config.host}:${config.port}/api/docs`,
    );
  }
  logger.log(`Environment: ${config.nodeEnv}`);
}

bootstrap().catch((error) => {
  console.error("Failed to bootstrap:", error);
  process.exit(1);
});
