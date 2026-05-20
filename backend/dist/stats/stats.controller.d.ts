import { Response } from "express";
import { StatsService } from "./stats.service";
import { PdfReportService } from "./pdf-report.service";
export declare class StatsController {
    private readonly statsService;
    private readonly pdfReportService;
    constructor(statsService: StatsService, pdfReportService: PdfReportService);
    getDashboardStats(): Promise<{
        statusCode: number;
        success: boolean;
        data: {
            citizens: number;
            vaccinationRate: number;
            consultations: number;
            stockAlerts: number;
            trends: import("./stats.service").TrendSet;
        };
    }>;
    getCitizenCount(): Promise<{
        statusCode: number;
        success: boolean;
        data: {
            count: number;
        };
    }>;
    getVaccinationRate(): Promise<{
        statusCode: number;
        success: boolean;
        data: {
            rate: number;
        };
    }>;
    getConsultationCount(): Promise<{
        statusCode: number;
        success: boolean;
        data: {
            count: number;
        };
    }>;
    getStockAlerts(): Promise<{
        statusCode: number;
        success: boolean;
        data: {
            count: number;
        };
    }>;
    getMapData(): Promise<{
        statusCode: number;
        success: boolean;
        data: {
            id: string;
            name: string;
            x: number;
            y: number;
            status: string;
            level: string;
            region: string;
        }[];
    }>;
    getEpidemicHeatmap(): Promise<{
        statusCode: number;
        success: boolean;
        data: {
            zones: {
                id: string;
                name: string;
                x: number;
                y: number;
                intensity: number;
                cases: number;
                diseases: string[];
                severity: string;
            }[];
            summary: {
                totalCases: number;
                activeZones: number;
                vaccinationRate: number;
                period: string;
            };
        };
    }>;
    exportReports(res: Response): Promise<Response<any, Record<string, any>>>;
    exportPdf(res: Response): Promise<Response<any, Record<string, any>>>;
}
