import { CanActivate, ExecutionContext } from "@nestjs/common";
import { Observable } from "rxjs";
export declare class PayloadSizeGuard implements CanActivate {
    private readonly maxSize;
    constructor(maxSizeInMB?: number);
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean>;
}
