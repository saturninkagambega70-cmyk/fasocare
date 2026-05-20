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
exports.PharmacyPrescription = void 0;
const typeorm_1 = require("typeorm");
const pharmacy_entity_1 = require("./pharmacy.entity");
const user_entity_1 = require("../../users/entities/user.entity");
let PharmacyPrescription = class PharmacyPrescription {
};
exports.PharmacyPrescription = PharmacyPrescription;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], PharmacyPrescription.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => pharmacy_entity_1.Pharmacy),
    __metadata("design:type", pharmacy_entity_1.Pharmacy)
], PharmacyPrescription.prototype, "pharmacy", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], PharmacyPrescription.prototype, "consultationId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    __metadata("design:type", user_entity_1.User)
], PharmacyPrescription.prototype, "pharmacist", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], PharmacyPrescription.prototype, "medicineName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", default: 0 }),
    __metadata("design:type", Number)
], PharmacyPrescription.prototype, "quantityDispensed", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], PharmacyPrescription.prototype, "dispensedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], PharmacyPrescription.prototype, "pharmacyName", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], PharmacyPrescription.prototype, "pharmacyPhone", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], PharmacyPrescription.prototype, "pharmacistName", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], PharmacyPrescription.prototype, "pharmacistLicense", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], PharmacyPrescription.prototype, "cachetSignature", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], PharmacyPrescription.prototype, "cachetToken", void 0);
exports.PharmacyPrescription = PharmacyPrescription = __decorate([
    (0, typeorm_1.Entity)("pharmacy_prescriptions")
], PharmacyPrescription);
//# sourceMappingURL=pharmacy-prescription.entity.js.map