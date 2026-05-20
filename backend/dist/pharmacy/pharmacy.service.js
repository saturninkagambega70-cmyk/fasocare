"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PharmacyService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const crypto = __importStar(require("crypto"));
const pharmacy_entity_1 = require("./entities/pharmacy.entity");
const medicine_stock_entity_1 = require("./entities/medicine-stock.entity");
const pharmacy_prescription_entity_1 = require("./entities/pharmacy-prescription.entity");
const app_config_service_1 = require("../config/app-config.service");
let PharmacyService = class PharmacyService {
    constructor(pharmacyRepository, stockRepository, prescriptionRepository, config) {
        this.pharmacyRepository = pharmacyRepository;
        this.stockRepository = stockRepository;
        this.prescriptionRepository = prescriptionRepository;
        this.config = config;
    }
    async findAll() {
        return this.pharmacyRepository.find({ relations: ["admin"] });
    }
    async findAllPublic() {
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
    isPharmacyOpen(pharmacy) {
        if (pharmacy.isOpen === false)
            return false;
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
        if (!pharmacy.openingHours)
            return true;
        try {
            const hours = JSON.parse(pharmacy.openingHours);
            const dayHours = hours[dayName];
            if (!dayHours || dayHours === "closed")
                return false;
            const [openTime, closeTime] = dayHours.split("-");
            const [openHour, openMin] = openTime.split(":").map(Number);
            const [closeHour, closeMin] = closeTime.split(":").map(Number);
            const openMinutes = openHour * 60 + openMin;
            const closeMinutes = closeHour * 60 + closeMin;
            return currentTime >= openMinutes && currentTime <= closeMinutes;
        }
        catch {
            return true;
        }
    }
    async findByAdmin(adminId) {
        return this.pharmacyRepository.find({ where: { admin: { id: adminId } } });
    }
    parseCoords(location) {
        if (!location || !location.includes(","))
            return null;
        const parts = location.split(",");
        const lat = parseFloat(parts[0]);
        const lng = parseFloat(parts[1]);
        if (isNaN(lat) || isNaN(lng))
            return null;
        return { latitude: lat, longitude: lng };
    }
    async getStock(pharmacyId, actor) {
        if (actor?.role === "PHARMACIST") {
            const pharmacy = await this.pharmacyRepository.findOne({
                where: { id: pharmacyId },
                relations: ["admin"],
            });
            if (!pharmacy)
                throw new common_1.NotFoundException("Pharmacy not found");
            if (pharmacy.admin?.id !== actor.userId)
                throw new common_1.ForbiddenException("Accès interdit à cette pharmacie");
        }
        return this.stockRepository.find({
            where: { pharmacy: { id: pharmacyId } },
        });
    }
    async updateStock(stockId, quantity, actor) {
        const stock = await this.stockRepository.findOne({
            where: { id: stockId },
            relations: ["pharmacy", "pharmacy.admin"],
        });
        if (!stock)
            throw new common_1.NotFoundException("Stock item not found");
        if (actor?.role === "PHARMACIST" &&
            stock.pharmacy?.admin?.id !== actor.userId) {
            throw new common_1.ForbiddenException("Accès interdit à ce stock");
        }
        stock.quantity = quantity;
        return this.stockRepository.save(stock);
    }
    async createPharmacy(data) {
        const pharmacy = this.pharmacyRepository.create(data);
        return this.pharmacyRepository.save(pharmacy);
    }
    async getLowStockAlerts(adminId) {
        return this.stockRepository.find({
            where: {
                pharmacy: { admin: { id: adminId } },
                quantity: (0, typeorm_2.LessThan)(10),
            },
            relations: ["pharmacy"],
        });
    }
    async getStats(adminId) {
        const stocks = await this.stockRepository.count({
            where: { pharmacy: { admin: { id: adminId } } },
        });
        const shortages = await this.stockRepository.count({
            where: {
                pharmacy: { admin: { id: adminId } },
                quantity: (0, typeorm_2.LessThan)(5),
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
    async findByPharmacist(pharmacistId) {
        return this.pharmacyRepository.findOne({
            where: { admin: { id: pharmacistId } },
            relations: ["admin"],
        });
    }
    async linkPrescription(data) {
        const pharmacy = await this.pharmacyRepository.findOne({
            where: { id: data.pharmacyId },
            relations: ["admin"],
        });
        if (!pharmacy)
            throw new common_1.NotFoundException("Pharmacie non trouvée");
        const pName = data.pharmacyName || pharmacy.name;
        const pPhone = data.pharmacyPhone || pharmacy.phone;
        const phName = data.pharmacistName || pharmacy.admin?.name || "Pharmacien";
        const phLicense = data.pharmacistLicense || pharmacy.admin?.licenseNumber || "";
        const payload = `${data.consultationId}|${data.medicineName}|${data.quantityDispensed}|${pName}|${phName}|${phLicense}|${Date.now()}`;
        const secret = this.config.jwtSecret || "faso-cachet-secret";
        const signature = crypto
            .createHmac("sha256", secret)
            .update(payload)
            .digest("hex")
            .substring(0, 16);
        const cachetToken = `CACHET-${data.consultationId.replace(/-/g, "").substring(0, 8)}-${Date.now().toString(36)}-${signature.substring(0, 8)}`;
        const record = this.prescriptionRepository.create({
            pharmacy: { id: data.pharmacyId },
            consultationId: data.consultationId,
            pharmacist: { id: data.pharmacistId },
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
    async getDispensationsByConsultation(consultationId) {
        return this.prescriptionRepository.find({
            where: { consultationId },
            order: { dispensedAt: "ASC" },
        });
    }
    async verifyCachetToken(token) {
        const record = await this.prescriptionRepository.findOne({
            where: { cachetToken: token },
        });
        if (!record)
            throw new common_1.NotFoundException("Cachet introuvable ou invalide");
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
    async deductFromStock(pharmacyId, medicineName, quantity = 1) {
        const stockItems = await this.stockRepository.find({
            where: { pharmacy: { id: pharmacyId } },
            order: { expiryDate: "ASC" },
        });
        if (stockItems.length === 0)
            throw new common_1.NotFoundException("Aucun stock trouvé");
        let remaining = quantity;
        for (const item of stockItems) {
            if (item.medicineName.toLowerCase() !== medicineName.toLowerCase())
                continue;
            if (remaining <= 0)
                break;
            const deduct = Math.min(item.quantity, remaining);
            item.quantity -= deduct;
            remaining -= deduct;
            await this.stockRepository.save(item);
        }
    }
};
exports.PharmacyService = PharmacyService;
exports.PharmacyService = PharmacyService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(pharmacy_entity_1.Pharmacy)),
    __param(1, (0, typeorm_1.InjectRepository)(medicine_stock_entity_1.MedicineStock)),
    __param(2, (0, typeorm_1.InjectRepository)(pharmacy_prescription_entity_1.PharmacyPrescription)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        app_config_service_1.AppConfigService])
], PharmacyService);
//# sourceMappingURL=pharmacy.service.js.map