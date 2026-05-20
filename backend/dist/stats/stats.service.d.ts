import { Repository } from "typeorm";
import { User } from "../users/entities/user.entity";
import { Consultation } from "../medical/entities/consultation.entity";
import { VaccinationRecord } from "../vaccination/entities/vaccination-record.entity";
import { MedicineStock } from "../pharmacy/entities/medicine-stock.entity";
import { EpidemicReport } from "../medical/entities/epidemic-report.entity";
export interface TrendSet {
    citizens: string;
    vaccination: string;
    consultations: string;
    alerts: string;
}
export declare class StatsService {
    private usersRepository;
    private consultationsRepository;
    private vaccinationRepository;
    private medicineStockRepository;
    private epidemicReportRepository;
    constructor(usersRepository: Repository<User>, consultationsRepository: Repository<Consultation>, vaccinationRepository: Repository<VaccinationRecord>, medicineStockRepository: Repository<MedicineStock>, epidemicReportRepository: Repository<EpidemicReport>);
    getDashboardStats(): Promise<{
        statusCode: number;
        success: boolean;
        data: {
            citizens: number;
            vaccinationRate: number;
            consultations: number;
            stockAlerts: number;
            trends: TrendSet;
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
    private getDashboardTrends;
    private formatTrend;
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
    exportReports(): Promise<string>;
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
}
