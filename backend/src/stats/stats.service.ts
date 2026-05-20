import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Between, LessThan, MoreThan, Repository, Raw } from "typeorm";
import { User, UserRole } from "../users/entities/user.entity";
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

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Consultation)
    private consultationsRepository: Repository<Consultation>,
    @InjectRepository(VaccinationRecord)
    private vaccinationRepository: Repository<VaccinationRecord>,
    @InjectRepository(MedicineStock)
    private medicineStockRepository: Repository<MedicineStock>,
    @InjectRepository(EpidemicReport)
    private epidemicReportRepository: Repository<EpidemicReport>,
  ) {}

  async getDashboardStats() {
    const [citizens, consultations, vaccinations, stockAlerts, trends] =
      await Promise.all([
        this.getCitizenCount(),
        this.getConsultationCount(),
        this.getVaccinationRate(),
        this.getStockAlerts(),
        this.getDashboardTrends(),
      ]);

    return {
      statusCode: 200,
      success: true,
      data: {
        citizens: citizens.data.count,
        vaccinationRate: vaccinations.data.rate,
        consultations: consultations.data.count,
        stockAlerts: stockAlerts.data.count,
        trends,
      },
    };
  }

  async getCitizenCount() {
    const count = await this.usersRepository.count();
    return {
      statusCode: 200,
      success: true,
      data: { count },
    };
  }

  async getVaccinationRate() {
    const totalPatients = await this.usersRepository.count({
      where: { roles: Raw((alias) => `${alias} LIKE '%${UserRole.PATIENT}%'`) },
    });

    if (totalPatients === 0) {
      return {
        statusCode: 200,
        success: true,
        data: { rate: 0 },
      };
    }

    const vaccinatedRows = await this.vaccinationRepository
      .createQueryBuilder("vr")
      .select("COUNT(DISTINCT vr.patientId)", "count")
      .getRawOne<{ count: string }>();

    const vaccinatedPatients = Number(vaccinatedRows?.count || 0);
    const rate = Number(
      ((vaccinatedPatients / totalPatients) * 100).toFixed(1),
    );

    return {
      statusCode: 200,
      success: true,
      data: { rate },
    };
  }

  async getConsultationCount() {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const count = await this.consultationsRepository.count({
      where: { createdAt: MoreThan(oneHourAgo) },
    });

    return {
      statusCode: 200,
      success: true,
      data: { count },
    };
  }

  async getStockAlerts() {
    const lowStockCount = await this.medicineStockRepository.count({
      where: { quantity: LessThan(10) },
    });

    return {
      statusCode: 200,
      success: true,
      data: { count: lowStockCount },
    };
  }

  private async getDashboardTrends(): Promise<TrendSet> {
    const now = Date.now();
    const last30Days = new Date(now - 30 * 24 * 60 * 60 * 1000);
    const previous30DaysStart = new Date(now - 60 * 24 * 60 * 60 * 1000);
    const lastHour = new Date(now - 60 * 60 * 1000);
    const previousHourStart = new Date(now - 2 * 60 * 60 * 1000);

    const [
      recentCitizens,
      previousCitizens,
      recentVaccinatedPatients,
      previousVaccinatedPatients,
      recentConsultations,
      previousConsultations,
    ] = await Promise.all([
      this.usersRepository.count({
        where: {
          roles: Raw((alias) => `${alias} LIKE '%${UserRole.PATIENT}%'`),
          createdAt: MoreThan(last30Days),
        },
      }),
      this.usersRepository.count({
        where: {
          roles: Raw((alias) => `${alias} LIKE '%${UserRole.PATIENT}%'`),
          createdAt: Between(previous30DaysStart, last30Days),
        },
      }),
      this.vaccinationRepository
        .createQueryBuilder("vr")
        .select("COUNT(DISTINCT vr.patientId)", "count")
        .where("vr.createdAt > :date", { date: last30Days })
        .getRawOne<{ count: string }>(),
      this.vaccinationRepository
        .createQueryBuilder("vr")
        .select("COUNT(DISTINCT vr.patientId)", "count")
        .where("vr.createdAt > :date", { date: previous30DaysStart })
        .andWhere("vr.createdAt <= :upperBound", { upperBound: last30Days })
        .getRawOne<{ count: string }>(),
      this.consultationsRepository.count({
        where: { createdAt: MoreThan(lastHour) },
      }),
      this.consultationsRepository.count({
        where: {
          createdAt: Between(previousHourStart, lastHour),
        },
      }),
    ]);

    return {
      citizens: this.formatTrend(recentCitizens, previousCitizens),
      vaccination: this.formatTrend(
        Number(recentVaccinatedPatients?.count || 0),
        Number(previousVaccinatedPatients?.count || 0),
      ),
      consultations: this.formatTrend(
        recentConsultations,
        previousConsultations,
      ),
      alerts: "+0%",
    };
  }

  private formatTrend(current: number, previous: number) {
    if (current === 0 && previous === 0) {
      return "+0%";
    }

    if (previous === 0) {
      return "+100%";
    }

    const delta = ((current - previous) / previous) * 100;
    const rounded = Math.round(delta);
    const sign = rounded >= 0 ? "+" : "";

    return `${sign}${rounded}%`;
  }

  async getMapData() {
    // Generate dynamic regional health level based on local db stock alerts
    const lowStockCount = await this.medicineStockRepository.count({
      where: { quantity: LessThan(10) },
    });

    // Calculate logic
    const statusCity1 = lowStockCount > 5 ? "ALERT" : "NORMAL";
    const levelCity1 = lowStockCount > 5 ? "45%" : "90%";
    const statusCity2 = lowStockCount > 10 ? "CRITICAL" : "NORMAL";
    const levelCity2 = lowStockCount > 10 ? "12%" : "88%";
    const statusCity4 = lowStockCount > 2 ? "CRITICAL" : "ALERT";
    const levelCity4 = lowStockCount > 2 ? "15%" : "50%";

    const cities = [
      {
        id: "1",
        name: "Ouagadougou",
        x: 45,
        y: 48,
        status: statusCity1,
        level: levelCity1,
        region: "Centre",
      },
      {
        id: "2",
        name: "Bobo-Dioulasso",
        x: 25,
        y: 75,
        status: statusCity2,
        level: levelCity2,
        region: "Hauts-Bassins",
      },
      {
        id: "3",
        name: "Koudougou",
        x: 38,
        y: 52,
        status: "NORMAL",
        level: "92%",
        region: "Centre-Ouest",
      },
      {
        id: "4",
        name: "Kaya",
        x: 55,
        y: 35,
        status: statusCity4,
        level: levelCity4,
        region: "Centre-Nord",
      },
      {
        id: "5",
        name: "Fada N'Gourma",
        x: 75,
        y: 55,
        status: "NORMAL",
        level: "85%",
        region: "Reg. de l'Est",
      },
    ];

    return {
      statusCode: 200,
      success: true,
      data: cities,
    };
  }

  async exportReports() {
    const consultations = await this.consultationsRepository.find({
      relations: ["patient", "doctor"],
      take: 200,
      order: { createdAt: "DESC" },
    });

    let csv =
      "ID_Consultation,Date,Patient,Docteur,Diagnostic,Niveau_Urgence\n";
    for (const c of consultations) {
      const patientName = c.patient?.name || "N/A";
      const docName = c.doctor?.name || "N/A";
      const diag = c.diagnosis || "Non spécifié";
      const urg = c.urgencyLevel || "NORMAL";
      const cDate = c.createdAt ? c.createdAt.toISOString() : "N/A";
      csv += `"${c.id}","${cDate}","${patientName}","${docName}","${diag}","${urg}"\n`;
    }

    return csv;
  }

  /**
   * Génère les données de la carte thermique épidémiologique.
   * Agrège les signalements épidémiques par localité et maladie,
   * puis complète avec des zones de couverture vaccinale.
   */
  async getEpidemicHeatmap() {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Fetch recent epidemic reports
    const reports = await this.epidemicReportRepository.find({
      where: { createdAt: MoreThan(thirtyDaysAgo) },
      order: { createdAt: "DESC" },
    });

    // Aggregate by location
    const locationMap = new Map<
      string,
      { cases: number; diseases: string[] }
    >();
    for (const r of reports) {
      const loc = r.location || "Inconnu";
      const existing = locationMap.get(loc) || { cases: 0, diseases: [] };
      existing.cases += r.casesCount || 1;
      if (r.disease && !existing.diseases.includes(r.disease)) {
        existing.diseases.push(r.disease);
      }
      locationMap.set(loc, existing);
    }

    // Regional coordinates for Burkina Faso
    const regionCoords: Record<string, { x: number; y: number }> = {
      Ouagadougou: { x: 45, y: 48 },
      "Bobo-Dioulasso": { x: 25, y: 75 },
      Koudougou: { x: 38, y: 52 },
      Kaya: { x: 55, y: 35 },
      "Fada N'Gourma": { x: 75, y: 55 },
      Dédougou: { x: 30, y: 45 },
      Banfora: { x: 22, y: 82 },
      Ouahigouya: { x: 42, y: 25 },
      Tenkodogo: { x: 60, y: 60 },
      Dori: { x: 62, y: 18 },
      Ziniaré: { x: 48, y: 42 },
      Manga: { x: 50, y: 68 },
      Gaoua: { x: 20, y: 88 },
    };

    // Build heatmap zones
    const zones = Array.from(locationMap.entries()).map(([location, data]) => {
      const coords = regionCoords[location] || { x: 50, y: 50 };
      const intensity = Math.min(data.cases / 50, 1); // Normalize 0-1
      return {
        id: location,
        name: location,
        x: coords.x,
        y: coords.y,
        intensity,
        cases: data.cases,
        diseases: data.diseases,
        severity:
          intensity > 0.7 ? "CRITICAL" : intensity > 0.3 ? "MODERATE" : "LOW",
      };
    });

    // Add vaccination coverage overlay
    const totalPatients = await this.usersRepository.count({
      where: { roles: Raw((alias) => `${alias} LIKE '%${UserRole.PATIENT}%'`) },
    });
    const vaccinatedRows = await this.vaccinationRepository
      .createQueryBuilder("vr")
      .select("COUNT(DISTINCT vr.patientId)", "count")
      .getRawOne<{ count: string }>();
    const vaccinatedCount = Number(vaccinatedRows?.count || 0);
    const vaccinationRate =
      totalPatients > 0
        ? Number(((vaccinatedCount / totalPatients) * 100).toFixed(1))
        : 0;

    return {
      statusCode: 200,
      success: true,
      data: {
        zones,
        summary: {
          totalCases: reports.reduce((sum, r) => sum + (r.casesCount || 1), 0),
          activeZones: zones.length,
          vaccinationRate,
          period: "30 derniers jours",
        },
      },
    };
  }
}
