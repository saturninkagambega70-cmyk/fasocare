"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.securityValidationPipe = void 0;
const common_1 = require("@nestjs/common");
exports.securityValidationPipe = new common_1.ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: { enableImplicitConversion: true },
    exceptionFactory: (errors) => {
        const sanitizedErrors = errors.map((error) => ({
            field: error.property,
            message: "Invalid value provided",
        }));
        return new common_1.BadRequestException(sanitizedErrors);
    },
});
//# sourceMappingURL=security-validation.pipe.js.map