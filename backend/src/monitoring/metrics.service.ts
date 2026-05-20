import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as client from "prom-client";

@Injectable()
export class MetricsService {
  private readonly logger = new Logger(MetricsService.name);
  private readonly register: client.Registry;

  // HTTP metrics
  public readonly httpRequestsTotal: client.Counter<string>;
  public readonly httpRequestDuration: client.Histogram<string>;

  // Business metrics
  public readonly activeUsers: client.Gauge<string>;
  public readonly medicalRecordsTotal: client.Gauge<string>;
  public readonly consultationsToday: client.Counter<string>;
  public readonly vaccinationCoverage: client.Gauge<string>;
  public readonly apiErrorsTotal: client.Counter<string>;
  public readonly dbQueryDuration: client.Histogram<string>;

  constructor(private readonly configService: ConfigService) {
    this.register = new client.Registry();

    // Add default metrics (memory, CPU, event loop, etc.)
    client.collectDefaultMetrics({
      register: this.register,
      prefix: "fasocare_",
    });

    // HTTP Request counter
    this.httpRequestsTotal = new client.Counter({
      name: "fasocare_http_requests_total",
      help: "Total number of HTTP requests",
      labelNames: ["method", "route", "status_code"],
      registers: [this.register],
    });

    // HTTP Request duration histogram
    this.httpRequestDuration = new client.Histogram({
      name: "fasocare_http_request_duration_seconds",
      help: "HTTP request duration in seconds",
      labelNames: ["method", "route", "status_code"],
      buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5, 10],
      registers: [this.register],
    });

    // Active users gauge
    this.activeUsers = new client.Gauge({
      name: "fasocare_active_users",
      help: "Number of currently active users",
      registers: [this.register],
    });

    // Total medical records
    this.medicalRecordsTotal = new client.Gauge({
      name: "fasocare_medical_records_total",
      help: "Total number of medical records in the system",
      registers: [this.register],
    });

    // Consultations today counter
    this.consultationsToday = new client.Counter({
      name: "fasocare_consultations_today_total",
      help: "Total number of consultations registered today",
      labelNames: ["type"],
      registers: [this.register],
    });

    // Vaccination coverage gauge
    this.vaccinationCoverage = new client.Gauge({
      name: "fasocare_vaccination_coverage_percent",
      help: "Vaccination coverage percentage by region and age group",
      labelNames: ["region", "age_group"],
      registers: [this.register],
    });

    // API errors counter
    this.apiErrorsTotal = new client.Counter({
      name: "fasocare_api_errors_total",
      help: "Total number of API errors",
      labelNames: ["method", "route", "error_type"],
      registers: [this.register],
    });

    // Database query duration
    this.dbQueryDuration = new client.Histogram({
      name: "fasocare_db_query_duration_seconds",
      help: "Database query duration in seconds",
      labelNames: ["operation", "table"],
      buckets: [0.001, 0.01, 0.1, 0.5, 1, 2, 5],
      registers: [this.register],
    });

    this.logger.log("Metrics service initialized");
  }

  /**
   * Get metrics in Prometheus format
   */
  async getMetrics(): Promise<string> {
    return this.register.metrics();
  }

  /**
   * Record HTTP request metrics
   */
  recordHttpRequest(
    method: string,
    route: string,
    statusCode: number,
    duration: number,
  ): void {
    const statusCodeString = statusCode.toString();
    this.httpRequestsTotal.inc({
      method,
      route,
      status_code: statusCodeString,
    });
    this.httpRequestDuration.observe(
      { method, route, status_code: statusCodeString },
      duration,
    );
  }

  /**
   * Record API error
   */
  recordApiError(method: string, route: string, errorType: string): void {
    this.apiErrorsTotal.inc({ method, route, error_type: errorType });
  }

  /**
   * Update active users count
   */
  setActiveUsers(count: number): void {
    this.activeUsers.set(count);
  }

  /**
   * Update total medical records
   */
  setMedicalRecordsTotal(count: number): void {
    this.medicalRecordsTotal.set(count);
  }

  /**
   * Increment consultations today
   */
  incrementConsultations(type: string = "general"): void {
    this.consultationsToday.inc({ type });
  }

  /**
   * Update vaccination coverage
   */
  setVaccinationCoverage(
    region: string,
    ageGroup: string,
    percentage: number,
  ): void {
    this.vaccinationCoverage.set({ region, age_group: ageGroup }, percentage);
  }

  /**
   * Record database query duration
   */
  recordDbQuery(operation: string, table: string, duration: number): void {
    this.dbQueryDuration.observe({ operation, table }, duration);
  }

  /**
   * Get the Prometheus registry
   */
  getRegistry(): client.Registry {
    return this.register;
  }
}
