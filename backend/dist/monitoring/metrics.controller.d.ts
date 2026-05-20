import { Response } from "express";
import { MetricsService } from "./metrics.service";
import { ConfigService } from "@nestjs/config";
export declare class MetricsController {
    private readonly metricsService;
    private readonly configService;
    constructor(metricsService: MetricsService, configService: ConfigService);
    getMetrics(res: Response): Promise<void>;
}
