"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var MetricsMiddleware_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricsMiddleware = void 0;
const common_1 = require("@nestjs/common");
const metrics_service_1 = require("./metrics.service");
let MetricsMiddleware = MetricsMiddleware_1 = class MetricsMiddleware {
    constructor(metricsService) {
        this.metricsService = metricsService;
        this.logger = new common_1.Logger(MetricsMiddleware_1.name);
    }
    use(req, res, next) {
        const start = Date.now();
        const { method, path } = req;
        const originalEnd = res.end.bind(res);
        res.end = (...args) => {
            const duration = (Date.now() - start) / 1000;
            const statusCode = res.statusCode;
            const route = this.getRoutePattern(req) || path;
            if (!path.includes("/metrics")) {
                this.metricsService.recordHttpRequest(method, route, statusCode, duration);
                if (statusCode < 400) {
                    if (route.includes("/medical/consultations") && method === "POST") {
                        this.metricsService.incrementConsultations("general");
                    }
                    else if (route.includes("/auth/login") && method === "POST") {
                        this.metricsService.setActiveUsers(1);
                    }
                    else if (route.includes("/users") && method === "POST") {
                        this.metricsService.setMedicalRecordsTotal(1);
                    }
                }
                if (duration > 1) {
                    this.logger.warn(`Slow request: ${method} ${route} took ${duration.toFixed(3)}s`);
                }
            }
            originalEnd(...args);
            return res;
        };
        next();
    }
    getRoutePattern(req) {
        const route = req.route;
        if (route && route.path) {
            return route.path;
        }
        if (req.baseUrl) {
            return req.baseUrl + (req.route?.path || req.path);
        }
        return undefined;
    }
};
exports.MetricsMiddleware = MetricsMiddleware;
exports.MetricsMiddleware = MetricsMiddleware = MetricsMiddleware_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [metrics_service_1.MetricsService])
], MetricsMiddleware);
//# sourceMappingURL=metrics.middleware.js.map