import { Strategy } from "passport-jwt";
import { AppConfigService } from "../config/app-config.service";
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    private readonly config;
    constructor(config: AppConfigService);
    validate(payload: any): Promise<{
        id: any;
        userId: any;
        phone: any;
        roles: any;
        role: any;
        activeRole: any;
        isVerified: boolean;
    }>;
}
export {};
