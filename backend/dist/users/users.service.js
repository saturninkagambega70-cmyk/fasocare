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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("./entities/user.entity");
const app_config_service_1 = require("../config/app-config.service");
const CryptoJS = __importStar(require("crypto-js"));
let UsersService = class UsersService {
    constructor(userRepository, configService) {
        this.userRepository = userRepository;
        this.configService = configService;
    }
    cleanPhone(phone) {
        if (!phone)
            return "";
        const digits = phone.replace(/\D/g, "");
        return digits.length > 8 ? digits.slice(-8) : digits;
    }
    buildPhoneHash(phone) {
        const key = this.configService.encryptionKey;
        if (!key) {
            throw new Error("ENCRYPTION_KEY is required");
        }
        return CryptoJS.SHA256(phone + key).toString();
    }
    async findOneByPhone(phone) {
        const sanitized = this.cleanPhone(phone);
        const phoneHash = this.buildPhoneHash(sanitized);
        return this.userRepository
            .createQueryBuilder("user")
            .where("user.phone_hash = :phoneHash", { phoneHash })
            .getOne();
    }
    async findById(id) {
        return this.userRepository.findOne({ where: { id } });
    }
    async findByIdWithSecurityFields(id) {
        return this.userRepository
            .createQueryBuilder("user")
            .addSelect([
            "user.refreshTokenHash",
            "user.resetPasswordOTP",
            "user.resetPasswordOTPExpiry",
            "user.twoFAOTP",
            "user.twoFAOTPExpiry",
        ])
            .where("user.id = :id", { id })
            .getOne();
    }
    async findOneByPhoneWithSecurityFields(phone) {
        const sanitized = this.cleanPhone(phone);
        const phoneHash = this.buildPhoneHash(sanitized);
        return this.userRepository
            .createQueryBuilder("user")
            .addSelect([
            "user.refreshTokenHash",
            "user.resetPasswordOTP",
            "user.resetPasswordOTPExpiry",
            "user.twoFAOTP",
            "user.twoFAOTPExpiry",
        ])
            .where("user.phone_hash = :phoneHash", { phoneHash })
            .getOne();
    }
    async update(id, updateData) {
        if (updateData.phone)
            updateData.phone = this.cleanPhone(updateData.phone);
        await this.userRepository.update(id, updateData);
    }
    async create(user) {
        if (user.phone)
            user.phone = this.cleanPhone(user.phone);
        const newUser = this.userRepository.create(user);
        return this.userRepository.save(newUser);
    }
    async findAll() {
        return this.userRepository.find();
    }
    async findChildren(parentId) {
        return this.userRepository.find({
            where: { parent: { id: parentId } },
        });
    }
    async isChildOfParent(parentId, childId) {
        const child = await this.userRepository.findOne({
            where: { id: childId, parent: { id: parentId } },
        });
        return !!child;
    }
    async addChild(parentId, childId) {
        await this.userRepository.update(childId, { parent: { id: parentId } });
    }
    async anonymize(id) {
        const user = await this.findById(id);
        if (!user)
            return;
        const anonPhone = (Date.now().toString() + id.replace(/\D/g, "")).slice(-8);
        const phoneHash = this.buildPhoneHash(anonPhone);
        await this.userRepository.update(id, {
            name: "ANONYMOUS",
            phone: anonPhone,
            phoneHash,
            licenseNumber: null,
            isVerified: false,
            refreshTokenHash: null,
            is2FAEnabled: false,
        });
    }
    async count() {
        return this.userRepository.count();
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        app_config_service_1.AppConfigService])
], UsersService);
//# sourceMappingURL=users.service.js.map