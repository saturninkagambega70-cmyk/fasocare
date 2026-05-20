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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("./users.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const public_decorator_1 = require("../auth/public.decorator");
const user_entity_1 = require("./entities/user.entity");
const qr_service_1 = require("../medical/qr.service");
let UsersController = class UsersController {
    constructor(usersService, qrService) {
        this.usersService = usersService;
        this.qrService = qrService;
    }
    async findAll() {
        const users = await this.usersService.findAll();
        return { users, total: users.length };
    }
    async findByPhone(phone) {
        const user = await this.usersService.findOneByPhone(phone);
        if (!user)
            throw new common_1.NotFoundException("Utilisateur non trouvé");
        const { passwordHash, refreshTokenHash, ...result } = user;
        return result;
    }
    async findById(id, req) {
        const user = await this.usersService.findById(id);
        if (!user)
            throw new common_1.NotFoundException("Utilisateur non trouvé");
        if (req.user.activeRole === user_entity_1.UserRole.PARENT ||
            req.user.roles?.includes(user_entity_1.UserRole.PARENT)) {
            const isChild = await this.usersService.isChildOfParent(req.user.userId, id);
            if (!isChild)
                throw new common_1.ForbiddenException("Vous ne pouvez consulter que les profils de vos enfants.");
        }
        const { passwordHash, refreshTokenHash, ...result } = user;
        return result;
    }
    async selfVerify(req) {
        throw new common_1.ForbiddenException("La vérification de compte doit passer par le workflow d'accréditation administrative.");
    }
    async validateUser(id) {
        const user = await this.usersService.findById(id);
        if (!user)
            throw new common_1.NotFoundException("Utilisateur non trouvé");
        if (user.roles?.includes(user_entity_1.UserRole.DOCTOR) ||
            user.roles?.includes(user_entity_1.UserRole.PHARMACIST)) {
            const { publicKey } = this.qrService.generateRSAKeyPair();
            await this.usersService.update(id, { isVerified: true, publicKey });
        }
        else {
            await this.usersService.update(id, { isVerified: true });
        }
        return { message: "Utilisateur validé avec succès" };
    }
    async suspendUser(id) {
        const user = await this.usersService.findById(id);
        if (!user)
            throw new common_1.NotFoundException("Utilisateur non trouvé");
        await this.usersService.update(id, { isVerified: false });
        return { message: "Utilisateur suspendu" };
    }
    async getProfile(req) {
        const user = await this.usersService.findById(req.user.userId);
        if (!user)
            throw new common_1.NotFoundException("Utilisateur non trouvé");
        const { passwordHash, refreshTokenHash, ...result } = user;
        return result;
    }
    async updateProfile(req, data) {
        await this.usersService.update(req.user.userId, data);
        const user = await this.usersService.findById(req.user.userId);
        if (!user)
            throw new common_1.NotFoundException("Utilisateur non trouvé");
        const { passwordHash, refreshTokenHash, ...result } = user;
        return result;
    }
    async getChildren(req) {
        return this.usersService.findChildren(req.user.userId);
    }
    async addChild(req, childPhone) {
        const child = await this.usersService.findOneByPhone(childPhone);
        if (!child)
            throw new common_1.NotFoundException("Enfant non trouvé avec ce numéro");
        await this.usersService.addChild(req.user.userId, child.id);
        return { message: "Enfant lié avec succès" };
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.HEALTH_MINISTRY),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "findAll", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)("find/:phone"),
    __param(0, (0, common_1.Param)("phone")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "findByPhone", null);
__decorate([
    (0, common_1.Get)("id/:id"),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.DOCTOR, user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.PHARMACIST, user_entity_1.UserRole.PARENT),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "findById", null);
__decorate([
    (0, common_1.Put)("self-verify"),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "selfVerify", null);
__decorate([
    (0, common_1.Post)(":id/validate"),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "validateUser", null);
__decorate([
    (0, common_1.Post)(":id/suspend"),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "suspendUser", null);
__decorate([
    (0, common_1.Get)("me"),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.PATIENT, user_entity_1.UserRole.DOCTOR, user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.PHARMACIST, user_entity_1.UserRole.PARENT, user_entity_1.UserRole.HEALTH_MINISTRY, user_entity_1.UserRole.INSPECTOR),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Put)("me"),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.PATIENT, user_entity_1.UserRole.DOCTOR, user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.PHARMACIST, user_entity_1.UserRole.PARENT),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.Get)("children"),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.PARENT),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getChildren", null);
__decorate([
    (0, common_1.Post)("children/add"),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.PARENT),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)("childPhone")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "addChild", null);
exports.UsersController = UsersController = __decorate([
    (0, common_1.Controller)("users"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        qr_service_1.QrService])
], UsersController);
//# sourceMappingURL=users.controller.js.map