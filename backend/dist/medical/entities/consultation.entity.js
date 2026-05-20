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
exports.Consultation = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../users/entities/user.entity");
const encryption_transformer_1 = require("../../common/encryption/encryption.transformer");
const prescription_item_entity_1 = require("./prescription-item.entity");
let Consultation = class Consultation {
};
exports.Consultation = Consultation;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], Consultation.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    __metadata("design:type", user_entity_1.User)
], Consultation.prototype, "patient", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    __metadata("design:type", user_entity_1.User)
], Consultation.prototype, "doctor", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "text",
        transformer: new encryption_transformer_1.EncryptionTransformer(),
    }),
    __metadata("design:type", String)
], Consultation.prototype, "diagnosis", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "text",
        nullable: true,
        transformer: new encryption_transformer_1.EncryptionTransformer(),
    }),
    __metadata("design:type", String)
], Consultation.prototype, "treatmentPlan", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "float", nullable: true }),
    __metadata("design:type", Number)
], Consultation.prototype, "temperature", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "float", nullable: true }),
    __metadata("design:type", Number)
], Consultation.prototype, "weight", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", nullable: true }),
    __metadata("design:type", Number)
], Consultation.prototype, "pulse", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "text",
        nullable: true,
        transformer: new encryption_transformer_1.EncryptionTransformer(),
    }),
    __metadata("design:type", String)
], Consultation.prototype, "bloodPressure", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", default: "NORMAL" }),
    __metadata("design:type", String)
], Consultation.prototype, "urgencyLevel", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", String)
], Consultation.prototype, "hospital", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "simple-json",
        nullable: true,
        transformer: new encryption_transformer_1.EncryptionTransformer(),
    }),
    __metadata("design:type", Object)
], Consultation.prototype, "prescription", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", default: false }),
    __metadata("design:type", Boolean)
], Consultation.prototype, "isDispensed", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], Consultation.prototype, "dispensedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true, nullable: true }),
    __metadata("design:type", String)
], Consultation.prototype, "qr_token", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], Consultation.prototype, "qr_expiry", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => prescription_item_entity_1.PrescriptionItem, (item) => item.consultation),
    __metadata("design:type", Array)
], Consultation.prototype, "items", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Consultation.prototype, "createdAt", void 0);
exports.Consultation = Consultation = __decorate([
    (0, typeorm_1.Entity)("consultations")
], Consultation);
//# sourceMappingURL=consultation.entity.js.map