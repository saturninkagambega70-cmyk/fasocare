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
exports.LabTest = exports.LabTestStatus = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../users/entities/user.entity");
const encryption_transformer_1 = require("../../common/encryption/encryption.transformer");
var LabTestStatus;
(function (LabTestStatus) {
    LabTestStatus["PENDING"] = "PENDING";
    LabTestStatus["COLLECTED"] = "COLLECTED";
    LabTestStatus["IN_PROGRESS"] = "IN_PROGRESS";
    LabTestStatus["COMPLETED"] = "COMPLETED";
    LabTestStatus["CANCELLED"] = "CANCELLED";
})(LabTestStatus || (exports.LabTestStatus = LabTestStatus = {}));
let LabTest = class LabTest {
};
exports.LabTest = LabTest;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], LabTest.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    __metadata("design:type", user_entity_1.User)
], LabTest.prototype, "patient", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    __metadata("design:type", user_entity_1.User)
], LabTest.prototype, "prescribedBy", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true }),
    __metadata("design:type", user_entity_1.User)
], LabTest.prototype, "performedBy", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], LabTest.prototype, "testName", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], LabTest.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "text",
        nullable: true,
        transformer: new encryption_transformer_1.EncryptionTransformer(),
    }),
    __metadata("design:type", String)
], LabTest.prototype, "resultValue", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "text",
        nullable: true,
        transformer: new encryption_transformer_1.EncryptionTransformer(),
    }),
    __metadata("design:type", String)
], LabTest.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "varchar",
        enum: LabTestStatus,
        default: LabTestStatus.PENDING,
    }),
    __metadata("design:type", String)
], LabTest.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], LabTest.prototype, "resultDate", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], LabTest.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], LabTest.prototype, "updatedAt", void 0);
exports.LabTest = LabTest = __decorate([
    (0, typeorm_1.Entity)("lab_tests")
], LabTest);
//# sourceMappingURL=lab-test.entity.js.map