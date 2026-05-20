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
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = exports.UserRole = void 0;
const typeorm_1 = require("typeorm");
const CryptoJS = __importStar(require("crypto-js"));
const encryption_transformer_1 = require("../../common/encryption/encryption.transformer");
var UserRole;
(function (UserRole) {
    UserRole["ADMIN"] = "ADMIN";
    UserRole["DOCTOR"] = "DOCTOR";
    UserRole["PHARMACIST"] = "PHARMACIST";
    UserRole["PARENT"] = "PARENT";
    UserRole["PATIENT"] = "PATIENT";
    UserRole["HEALTH_MINISTRY"] = "HEALTH_MINISTRY";
    UserRole["INSPECTOR"] = "INSPECTOR";
    UserRole["LEGAL_AUTHORITY"] = "LEGAL_AUTHORITY";
    UserRole["LAB_TECHNICIAN"] = "LAB_TECHNICIAN";
})(UserRole || (exports.UserRole = UserRole = {}));
let User = class User {
    hashFields() {
        if (this.phone) {
            const encryptionKey = process.env.ENCRYPTION_KEY;
            if (!encryptionKey) {
                throw new Error("ENCRYPTION_KEY is required");
            }
            this.phoneHash = CryptoJS.SHA256(this.phone + encryptionKey).toString();
        }
    }
};
exports.User = User;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], User.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User, (user) => user.children, { nullable: true }),
    __metadata("design:type", User)
], User.prototype, "parent", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => User, (user) => user.parent),
    __metadata("design:type", Array)
], User.prototype, "children", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: "phone",
        unique: true,
        transformer: new encryption_transformer_1.EncryptionTransformer(),
    }),
    __metadata("design:type", String)
], User.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "phone_hash", unique: true, select: false, nullable: true }),
    __metadata("design:type", String)
], User.prototype, "phoneHash", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: "name",
        nullable: true,
        transformer: new encryption_transformer_1.EncryptionTransformer(),
    }),
    __metadata("design:type", String)
], User.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], User.prototype, "gender", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], User.prototype, "bloodGroup", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], User.prototype, "passwordHash", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "refresh_token_hash", nullable: true, select: false }),
    __metadata("design:type", String)
], User.prototype, "refreshTokenHash", void 0);
__decorate([
    (0, typeorm_1.Column)("simple-array", { default: UserRole.PATIENT }),
    __metadata("design:type", Array)
], User.prototype, "roles", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", nullable: true }),
    __metadata("design:type", String)
], User.prototype, "activeRole", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], User.prototype, "licenseNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", String)
], User.prototype, "publicKey", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], User.prototype, "isVerified", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], User.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "reset_password_otp", nullable: true, select: false }),
    __metadata("design:type", String)
], User.prototype, "resetPasswordOTP", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "reset_password_otp_expiry", nullable: true, select: false }),
    __metadata("design:type", Date)
], User.prototype, "resetPasswordOTPExpiry", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "is_2fa_enabled", default: false }),
    __metadata("design:type", Boolean)
], User.prototype, "is2FAEnabled", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "two_fa_otp", nullable: true, select: false }),
    __metadata("design:type", String)
], User.prototype, "twoFAOTP", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "two_fa_otp_expiry", nullable: true, select: false }),
    __metadata("design:type", Date)
], User.prototype, "twoFAOTPExpiry", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "totp_secret", nullable: true, select: false }),
    __metadata("design:type", String)
], User.prototype, "totpSecret", void 0);
__decorate([
    (0, typeorm_1.Column)("simple-array", { name: "backup_codes", nullable: true }),
    __metadata("design:type", Array)
], User.prototype, "backupCodes", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    (0, typeorm_1.BeforeUpdate)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], User.prototype, "hashFields", null);
exports.User = User = __decorate([
    (0, typeorm_1.Entity)("users")
], User);
//# sourceMappingURL=user.entity.js.map