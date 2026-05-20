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
exports.EpidemicReport = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../users/entities/user.entity");
const encryption_transformer_1 = require("../../common/encryption/encryption.transformer");
let EpidemicReport = class EpidemicReport {
};
exports.EpidemicReport = EpidemicReport;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], EpidemicReport.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    __metadata("design:type", user_entity_1.User)
], EpidemicReport.prototype, "doctor", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], EpidemicReport.prototype, "disease", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], EpidemicReport.prototype, "casesCount", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], EpidemicReport.prototype, "location", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "text",
        nullable: true,
        transformer: new encryption_transformer_1.EncryptionTransformer(),
    }),
    __metadata("design:type", String)
], EpidemicReport.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: "SUBMITTED" }),
    __metadata("design:type", String)
], EpidemicReport.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], EpidemicReport.prototype, "createdAt", void 0);
exports.EpidemicReport = EpidemicReport = __decorate([
    (0, typeorm_1.Entity)("epidemic_reports")
], EpidemicReport);
//# sourceMappingURL=epidemic-report.entity.js.map