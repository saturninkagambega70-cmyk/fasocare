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
exports.TreatmentLog = exports.TreatmentLogStatus = void 0;
const typeorm_1 = require("typeorm");
const consultation_entity_1 = require("./consultation.entity");
const prescription_item_entity_1 = require("./prescription-item.entity");
const user_entity_1 = require("../../users/entities/user.entity");
var TreatmentLogStatus;
(function (TreatmentLogStatus) {
    TreatmentLogStatus["TAKEN"] = "TAKEN";
    TreatmentLogStatus["SKIPPED"] = "SKIPPED";
    TreatmentLogStatus["CONFIRMED"] = "CONFIRMED";
})(TreatmentLogStatus || (exports.TreatmentLogStatus = TreatmentLogStatus = {}));
let TreatmentLog = class TreatmentLog {
};
exports.TreatmentLog = TreatmentLog;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], TreatmentLog.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => consultation_entity_1.Consultation),
    __metadata("design:type", consultation_entity_1.Consultation)
], TreatmentLog.prototype, "consultation", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => prescription_item_entity_1.PrescriptionItem),
    __metadata("design:type", prescription_item_entity_1.PrescriptionItem)
], TreatmentLog.prototype, "item", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    __metadata("design:type", user_entity_1.User)
], TreatmentLog.prototype, "patient", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], TreatmentLog.prototype, "scheduledTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "datetime", nullable: true }),
    __metadata("design:type", Date)
], TreatmentLog.prototype, "takenAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", default: TreatmentLogStatus.TAKEN }),
    __metadata("design:type", String)
], TreatmentLog.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true }),
    __metadata("design:type", user_entity_1.User)
], TreatmentLog.prototype, "confirmedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "datetime", nullable: true }),
    __metadata("design:type", Date)
], TreatmentLog.prototype, "confirmedAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], TreatmentLog.prototype, "createdAt", void 0);
exports.TreatmentLog = TreatmentLog = __decorate([
    (0, typeorm_1.Entity)("treatment_logs")
], TreatmentLog);
//# sourceMappingURL=treatment-log.entity.js.map