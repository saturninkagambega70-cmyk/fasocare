"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var MetricsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const client = __importStar(require("prom-client"));
let MetricsService = MetricsService_1 = class MetricsService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(MetricsService_1.name);
        this.register = new client.Registry();
        client.collectDefaultMetrics({
            register: this.register,
            prefix: "fasocare_",
        });
        this.httpRequestsTotal = new client.Counter({
            name: "fasocare_http_requests_total",
            help: "Total number of HTTP requests",
            labelNames: ["method", "route", "status_code"],
            registers: [this.register],
        });
        this.httpRequestDuration = new client.Histogram({
            name: "fasocare_http_request_duration_seconds",
            help: "HTTP request duration in seconds",
            labelNames: ["method", "route", "status_code"],
            buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5, 10],
            registers: [this.register],
        });
        this.activeUsers = new client.Gauge({
            name: "fasocare_active_users",
            help: "Number of currently active users",
            registers: [this.register],
        });
        this.medicalRecordsTotal = new client.Gauge({
            name: "fasocare_medical_records_total",
            help: "Total number of medical records in the system",
            registers: [this.register],
        });
        this.consultationsToday = new client.Counter({
            name: "fasocare_consultations_today_total",
            help: "Total number of consultations registered today",
            labelNames: ["type"],
            registers: [this.register],
        });
        this.vaccinationCoverage = new client.Gauge({
            name: "fasocare_vaccination_coverage_percent",
            help: "Vaccination coverage percentage by region and age group",
            labelNames: ["region", "age_group"],
            registers: [this.register],
        });
        this.apiErrorsTotal = new client.Counter({
            name: "fasocare_api_errors_total",
            help: "Total number of API errors",
            labelNames: ["method", "route", "error_type"],
            registers: [this.register],
        });
        this.dbQueryDuration = new client.Histogram({
            name: "fasocare_db_query_duration_seconds",
            help: "Database query duration in seconds",
            labelNames: ["operation", "table"],
            buckets: [0.001, 0.01, 0.1, 0.5, 1, 2, 5],
            registers: [this.register],
        });
        this.logger.log("Metrics service initialized");
    }
    async getMetrics() {
        return this.register.metrics();
    }
    recordHttpRequest(method, route, statusCode, duration) {
        const statusCodeString = statusCode.toString();
        this.httpRequestsTotal.inc({
            method,
            route,
            status_code: statusCodeString,
        });
        this.httpRequestDuration.observe({ method, route, status_code: statusCodeString }, duration);
    }
    recordApiError(method, route, errorType) {
        this.apiErrorsTotal.inc({ method, route, error_type: errorType });
    }
    setActiveUsers(count) {
        this.activeUsers.set(count);
    }
    setMedicalRecordsTotal(count) {
        this.medicalRecordsTotal.set(count);
    }
    incrementConsultations(type = "general") {
        this.consultationsToday.inc({ type });
    }
    setVaccinationCoverage(region, ageGroup, percentage) {
        this.vaccinationCoverage.set({ region, age_group: ageGroup }, percentage);
    }
    recordDbQuery(operation, table, duration) {
        this.dbQueryDuration.observe({ operation, table }, duration);
    }
    getRegistry() {
        return this.register;
    }
};
exports.MetricsService = MetricsService;
exports.MetricsService = MetricsService = MetricsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], MetricsService);
//# sourceMappingURL=metrics.service.js.map