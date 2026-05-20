"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MedicineStock = void 0;
const typeorm_1 = require("typeorm");
const pharmacy_entity_1 = require("./pharmacy.entity");
let MedicineStock = class MedicineStock {
};
exports.MedicineStock = MedicineStock;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], MedicineStock.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => pharmacy_entity_1.Pharmacy),
    __metadata("design:type", pharmacy_entity_1.Pharmacy)
], MedicineStock.prototype, "pharmacy", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], MedicineStock.prototype, "medicineName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", default: 0 }),
    __metadata("design:type", Number)
], MedicineStock.prototype, "quantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", default: 10 }),
    __metadata("design:type", Number)
], MedicineStock.prototype, "thresholdAlert", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "date", nullable: true }),
    __metadata("design:type", Date)
], MedicineStock.prototype, "expiryDate", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], MedicineStock.prototype, "createdAt", void 0);
exports.MedicineStock = MedicineStock = __decorate([
    (0, typeorm_1.Entity)("medicine_stocks")
], MedicineStock);
//# sourceMappingURL=medicine-stock.entity.js.map