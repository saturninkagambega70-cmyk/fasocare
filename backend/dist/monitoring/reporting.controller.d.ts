import { Response } from "express";
import { ReportingService } from "./reporting.service";
export declare class ReportingController {
    private readonly reportingService;
    constructor(reportingService: ReportingService);
    getWeeklySummary(res: Response): Promise<void>;
    getStockAudit(res: Response): Promise<void>;
}
