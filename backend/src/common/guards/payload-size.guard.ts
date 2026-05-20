import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { Observable } from "rxjs";

/**
 * Guard that validates request payload size to prevent DoS attacks
 */
@Injectable()
export class PayloadSizeGuard implements CanActivate {
  private readonly maxSize: number;

  constructor(maxSizeInMB: number = 10) {
    this.maxSize = maxSizeInMB * 1024 * 1024;
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const contentLength = parseInt(
      request.headers["content-length"] || "0",
      10,
    );

    if (contentLength > this.maxSize) {
      return false;
    }
    return true;
  }
}
