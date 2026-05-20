import { Injectable, NestMiddleware, Logger } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { MetricsService } from "./metrics.service";

@Injectable()
export class MetricsMiddleware implements NestMiddleware {
  private readonly logger = new Logger(MetricsMiddleware.name);

  constructor(private readonly metricsService: MetricsService) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const start = Date.now();
    const { method, path } = req;

    // Store original end function
    const originalEnd = res.end.bind(res);

    // Override end function to capture response
    res.end = (...args: any[]): Response => {
      const duration = (Date.now() - start) / 1000; // Convert to seconds
      const statusCode = res.statusCode;

      // Get route pattern if available, otherwise use path
      const route = this.getRoutePattern(req) || path;

      // Skip metrics endpoint itself to avoid recursion
      if (!path.includes("/metrics")) {
        this.metricsService.recordHttpRequest(
          method,
          route,
          statusCode,
          duration,
        );

        // Auto-increment business metrics based on routes
        if (statusCode < 400) {
          if (route.includes("/medical/consultations") && method === "POST") {
            this.metricsService.incrementConsultations("general");
          } else if (route.includes("/auth/login") && method === "POST") {
            this.metricsService.setActiveUsers(1);
          } else if (route.includes("/users") && method === "POST") {
            this.metricsService.setMedicalRecordsTotal(1);
          }
        }

        // Log slow requests (over 1 second)
        if (duration > 1) {
          this.logger.warn(
            `Slow request: ${method} ${route} took ${duration.toFixed(3)}s`,
          );
        }
      }

      // Call original end
      originalEnd(...args);
      return res;
    };

    next();
  }

  /**
   * Extract route pattern from request
   * This helps group similar routes together (e.g., /users/123 -> /users/:id)
   */
  private getRoutePattern(req: Request): string | undefined {
    // Try to get route from various sources
    const route = req.route;
    if (route && route.path) {
      return route.path;
    }

    // Fallback: use baseUrl + path if available
    if (req.baseUrl) {
      return req.baseUrl + (req.route?.path || req.path);
    }

    return undefined;
  }
}
