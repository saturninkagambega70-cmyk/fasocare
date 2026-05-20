import { ConfigService } from "@nestjs/config";
import * as client from "prom-client";
export declare class MetricsService {
    private readonly configService;
    private readonly logger;
    private readonly register;
    readonly httpRequestsTotal: client.Counter<string>;
    readonly httpRequestDuration: client.Histogram<string>;
    readonly activeUsers: client.Gauge<string>;
    readonly medicalRecordsTotal: client.Gauge<string>;
    readonly consultationsToday: client.Counter<string>;
    readonly vaccinationCoverage: client.Gauge<string>;
    readonly apiErrorsTotal: client.Counter<string>;
    readonly dbQueryDuration: client.Histogram<string>;
    constructor(configService: ConfigService);
    getMetrics(): Promise<string>;
    recordHttpRequest(method: string, route: string, statusCode: number, duration: number): void;
    recordApiError(method: string, route: string, errorType: string): void;
    setActiveUsers(count: number): void;
    setMedicalRecordsTotal(count: number): void;
    incrementConsultations(type?: string): void;
    setVaccinationCoverage(region: string, ageGroup: string, percentage: number): void;
    recordDbQuery(operation: string, table: string, duration: number): void;
    getRegistry(): client.Registry;
}
