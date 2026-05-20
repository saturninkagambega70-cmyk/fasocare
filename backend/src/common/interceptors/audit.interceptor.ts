import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from "@nestjs/common";
import { Observable, throwError } from "rxjs";
import { catchError, tap } from "rxjs/operators";

/**
 * Interceptor for logging and audit trails
 */
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger("Audit");

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, user } = request;
    const userId = user?.sub || "anonymous";
    const timestamp = new Date().toISOString();

    this.logger.log(`[${timestamp}] ${method} ${url} - User: ${userId}`);

    return next.handle().pipe(
      tap(() => {
        this.logger.log(`[${timestamp}] ${method} ${url} - Success`);
      }),
      catchError((error) => {
        this.logger.error(
          `[${timestamp}] ${method} ${url} - Error: ${error.message}`,
        );
        return throwError(() => error);
      }),
    );
  }
}
