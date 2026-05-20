import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, LessThan } from "typeorm";
import * as crypto from "crypto";
import { Pharmacy } from "./entities/pharmacy.entity";
import { MedicineStock } from "./entities/medicine-stock.entity";
import { PharmacyPrescription } from "./entities/pharmacy-prescription.entity";
import { AppConfigService } from "../config/app-config.service";

@Injectable()
export class PharmacyService {
  constructor(
    @InjectRepository(Pharmacy)
    private pharmacyRepository: Repository<Pharmacy>,
    @InjectRepository(MedicineStock)
    private stockRepository: Repository<MedicineStock>,
    @InjectRepository(PharmacyPrescription)
    private prescriptionRepository: Repository<PharmacyPrescription>,
    private config: AppConfigService,
  ) {}

  async findAll(): Promise<Pharmacy[]> {
    return this.pharmacyRepository.find({ relations: ["admin"] });
  }

  async findAllPublic(): Promise<any[]> {
    const pharmacies = await this.pharmacyRepository.find();
    return pharmacies.map((p) => ({
      id: p.id,
      name: p.name,
      phone: p.phone,
      location: p.location,
      coords: p.location ? this.parseCoords(p.location) : null,
      openingHours: p.openingHours ? JSON.parse(p.openingHours) : null,
      isOpen: this.isPharmacyOpen(p),
      createdAt: p.createdAt,
    }));
  }

  private isPharmacyOpen(pharmacy: Pharmacy): boolean {
    if (pharmacy.isOpen === false) return false;

    const now = new Date();
    const dayNames = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];
    const dayName = dayNames[now.getDay()];
    const currentTime = now.getHours() * 60 + now.getMinutes();

    if (!pharmacy.openingHours) return true; // Default open if no hours set

    try {
      const hours = JSON.parse(pharmacy.openingHours);
      const dayHours = hours[dayName];

      if (!dayHours || dayHours === "closed") return false;

      const [openTime, closeTime] = dayHours.split("-");
      const [openHour, openMin] = openTime.split(":").map(Number);
      const [closeHour, closeMin] = closeTime.split(":").map(Number);

      const openMinutes = openHour * 60 + openMin;
      const closeMinutes = closeHour * 60 + closeMin;

      return currentTime >= openMinutes && currentTime <= closeMinutes;
    } catch {
      return true;
    }
  }

  async findByAdmin(adminId: string): Promise<Pharmacy[]> {
    return this.pharmacyRepository.find({ where: { admin: { id: adminId } } });
  }

  private parseCoords(
    location: string,
  ): { latitude: number; longitude: number } | null {
    if (!location || !location.includes(",")) return null;
    const parts = location.split(",");
    const lat = parseFloat(parts[0]);
    const lng = parseFloat(parts[1]);
    if (isNaN(lat) || isNaN(lng)) return null;
    return { latitude: lat, longitude: lng };
  }

  async getStock(
    pharmacyId: string,
    actor?: { userId: string; role: string },
  ): Promise<MedicineStock[]> {
    if (actor?.role === "PHARMACIST") {
      const pharmacy = await this.pharmacyRepository.findOne({
        where: { id: pharmacyId },
        relations: ["admin"],
      });
      if (!pharmacy) throw new NotFoundException("Pharmacy not found");
      if (pharmacy.admin?.id !== actor.userId)
        throw new ForbiddenException("Accès interdit à cette pharmacie");
    }
    return this.stockRepository.find({
      where: { pharmacy: { id: pharmacyId } },
    });
  }

  async updateStock(
    stockId: string,
    quantity: number,
    actor?: { userId: string; role: string },
  ): Promise<MedicineStock> {
    const stock = await this.stockRepository.findOne({
      where: { id: stockId },
      relations: ["pharmacy", "pharmacy.admin"],
    });
    if (!stock) throw new NotFoundException("Stock item not found");
    if (
      actor?.role === "PHARMACIST" &&
      stock.pharmacy?.admin?.id !== actor.userId
    ) {
      throw new ForbiddenException("Accès interdit à ce stock");
    }
    stock.quantity = quantity;
    return this.stockRepository.save(stock);
  }

  async createPharmacy(data: Partial<Pharmacy>): Promise<Pharmacy> {
    const pharmacy = this.pharmacyRepository.create(data);
    return this.pharmacyRepository.save(pharmacy);
  }

  async getLowStockAlerts(adminId: string): Promise<MedicineStock[]> {
    return this.stockRepository.find({
      where: {
        pharmacy: { admin: { id: adminId } },
        quantity: LessThan(10),
      },
      relations: ["pharmacy"],
    });
  }

  async getStats(adminId: string): Promise<any> {
    const stocks = await this.stockRepository.count({
      where: { pharmacy: { admin: { id: adminId } } },
    });
    const shortages = await this.stockRepository.count({
      where: {
        pharmacy: { admin: { id: adminId } },
        quantity: LessThan(5),
      },
    });
    const prescriptionsCount = await this.prescriptionRepository.count({
      where: { pharmacist: { id: adminId } },
    });
    return {
      prescriptions: prescriptionsCount,
      shortages,
      totalStocks: stocks,
    };
  }

  async findByPharmacist(pharmacistId: string): Promise<Pharmacy | null> {
    return this.pharmacyRepository.findOne({
      where: { admin: { id: pharmacistId } },
      relations: ["admin"],
    });
  }

  async linkPrescription(data: {
    pharmacyId: string;
    consultationId: string;
    pharmacistId: string;
    medicineName?: string;
    quantityDispensed?: number;
    pharmacistName?: string;
    pharmacistLicense?: string;
    pharmacyName?: string;
    pharmacyPhone?: string;
  }): Promise<PharmacyPrescription> {
    const pharmacy = await this.pharmacyRepository.findOne({
      where: { id: data.pharmacyId },
      relations: ["admin"],
    });
    if (!pharmacy) throw new NotFoundException("Pharmacie non trouvée");

    const pName = data.pharmacyName || pharmacy.name;
    const pPhone = data.pharmacyPhone || pharmacy.phone;
    const phName = data.pharmacistName || pharmacy.admin?.name || "Pharmacien";
    const phLicense =
      data.pharmacistLicense || pharmacy.admin?.licenseNumber || "";

    const payload = `${data.consultationId}|${data.medicineName}|${data.quantityDispensed}|${pName}|${phName}|${phLicense}|${Date.now()}`;
    const secret = this.config.jwtSecret || "faso-cachet-secret";
    const signature = crypto
      .createHmac("sha256", secret)
      .update(payload)
      .digest("hex")
      .substring(0, 16);
    const cachetToken = `CACHET-${data.consultationId.replace(/-/g, "").substring(0, 8)}-${Date.now().toString(36)}-${signature.substring(0, 8)}`;

    const record = this.prescriptionRepository.create({
      pharmacy: { id: data.pharmacyId } as any,
      consultationId: data.consultationId,
      pharmacist: { id: data.pharmacistId } as any,
      medicineName: data.medicineName || "Non spécifié",
      quantityDispensed: data.quantityDispensed || 1,
      pharmacyName: pName,
      pharmacyPhone: pPhone,
      pharmacistName: phName,
      pharmacistLicense: phLicense,
      cachetSignature: signature,
      cachetToken,
    });
    return this.prescriptionRepository.save(record);
  }

  async getDispensationsByConsultation(
    consultationId: string,
  ): Promise<PharmacyPrescription[]> {
    return this.prescriptionRepository.find({
      where: { consultationId },
      order: { dispensedAt: "ASC" },
    });
  }

  async verifyCachetToken(token: string): Promise<any> {
    const record = await this.prescriptionRepository.findOne({
      where: { cachetToken: token },
    });
    if (!record) throw new NotFoundException("Cachet introuvable ou invalide");
    return {
      valid: true,
      pharmacyName: record.pharmacyName,
      pharmacyPhone: record.pharmacyPhone,
      pharmacistName: record.pharmacistName,
      pharmacistLicense: record.pharmacistLicense,
      medicineName: record.medicineName,
      quantityDispensed: record.quantityDispensed,
      dispensedAt: record.dispensedAt,
      consultationId: record.consultationId,
      cachetToken: record.cachetToken,
    };
  }

  async deductFromStock(
    pharmacyId: string,
    medicineName: string,
    quantity: number = 1,
  ): Promise<void> {
    const stockItems = await this.stockRepository.find({
      where: { pharmacy: { id: pharmacyId } },
      order: { expiryDate: "ASC" }, // FIFO: oldest first
    });

    if (stockItems.length === 0)
      throw new NotFoundException("Aucun stock trouvé");

    let remaining = quantity;
    for (const item of stockItems) {
      if (item.medicineName.toLowerCase() !== medicineName.toLowerCase())
        continue;
      if (remaining <= 0) break;
      const deduct = Math.min(item.quantity, remaining);
      item.quantity -= deduct;
      remaining -= deduct;
      await this.stockRepository.save(item);
    }
  }
}
