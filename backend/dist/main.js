"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const app_config_service_1 = require("./config/app-config.service");
const helmet_1 = __importDefault(require("helmet"));
const swagger_1 = require("@nestjs/swagger");
async function bootstrap() {
    const logger = new common_1.Logger("Bootstrap");
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const config = app.get(app_config_service_1.AppConfigService);
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
    }));
    app.enableCors({
        origin: true,
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "Origin", "Accept"],
    });
    app.use((0, helmet_1.default)({
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
        crossOriginEmbedderPolicy: false,
        crossOriginResourcePolicy: { policy: "cross-origin" },
        hsts: {
            maxAge: 31536000,
            includeSubDomains: true,
            preload: true,
        },
        noSniff: true,
        xssFilter: true,
        referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    }));
    app.setGlobalPrefix("api/v1");
    const swaggerConfig = new swagger_1.DocumentBuilder()
        .setTitle("FasoCare National Health Platform API")
        .setDescription("Plateforme Nationale de Santé Numérique du Burkina Faso\n\n" +
        "## Overview\n" +
        "Sovereign national digital health infrastructure.\n\n" +
        "## Key Features\n" +
        "- RBAC: Doctors, Pharmacists, Admin\n" +
        "- Encryption: PII Protection\n" +
        "- USSD: SMS/USSD for rural areas\n" +
        "- Audit Trail: Complete logging")
        .setVersion("1.0.0")
        .setContact("Agence Numérique de Santé (ANS)", "https://ans.bf", "contact@ans.bf")
        .setLicense("Government License", "https://www.gouvernement.bf/")
        .addTag("Health", "Health checks")
        .addTag("Auth", "Authentication")
        .addTag("Users", "User management")
        .addTag("Medical", "Medical records")
        .addTag("Pharmacy", "Pharmacy services")
        .addTag("Laboratory", "Lab tests")
        .addTag("Vaccination", "Vaccination programs")
        .addTag("USSD", "USSD/SMS")
        .addBearerAuth({
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        name: "JWT",
        description: "Enter JWT token",
        in: "header",
    }, "access-token")
        .build();
    if (config.enableSwagger) {
        const document = swagger_1.SwaggerModule.createDocument(app, swaggerConfig);
        swagger_1.SwaggerModule.setup("api/docs", app, document, {
            swaggerOptions: {
                persistAuthorization: false,
                displayOperationId: true,
                docExpansion: "list",
            },
        });
    }
    app.enableShutdownHooks();
    await app.listen(config.port, config.host);
    logger.log(`[FasoCare Core] API: http://${config.host}:${config.port}/api/v1`);
    if (config.enableSwagger) {
        logger.log(`📚 Swagger Docs: http://${config.host}:${config.port}/api/docs`);
    }
    logger.log(`Environment: ${config.nodeEnv}`);
}
bootstrap().catch((error) => {
    console.error("Failed to bootstrap:", error);
    process.exit(1);
});
//# sourceMappingURL=main.js.map