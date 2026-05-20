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
exports.VaccinationRecord = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../users/entities/user.entity");
const encryption_transformer_1 = require("../../common/encryption/encryption.transformer");
let VaccinationRecord = class VaccinationRecord {
};
exports.VaccinationRecord = VaccinationRecord;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], VaccinationRecord.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    __metadata("design:type", user_entity_1.User)
], VaccinationRecord.prototype, "patient", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], VaccinationRecord.prototype, "vaccineName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "date" }),
    __metadata("design:type", Date)
], VaccinationRecord.prototype, "dateAdministered", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "date", nullable: true }),
    __metadata("design:type", Date)
], VaccinationRecord.prototype, "nextDoseDate", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        transformer: new encryption_transformer_1.EncryptionTransformer(),
    }),
    __metadata("design:type", String)
], VaccinationRecord.prototype, "batchNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", nullable: true }),
    __metadata("design:type", String)
], VaccinationRecord.prototype, "location", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], VaccinationRecord.prototype, "reminderSent", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], VaccinationRecord.prototype, "createdAt", void 0);
exports.VaccinationRecord = VaccinationRecord = __decorate([
    (0, typeorm_1.Entity)("vaccinations")
], VaccinationRecord);
//# sourceMappingURL=vaccination-record.entity.js.map