"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const common_1 = require("@nestjs/common");
const baseLogger = new common_1.Logger("FasoCare");
exports.logger = {
    error: (message, trace, context) => baseLogger.error(message, trace, context),
    warn: (message, context) => baseLogger.warn(message, context),
    info: (message, context) => baseLogger.log(message, context),
    http: (message, context) => baseLogger.log(message, context),
    debug: (message, context) => baseLogger.debug(message, context),
};
exports.default = exports.logger;
//# sourceMappingURL=logger.js.map