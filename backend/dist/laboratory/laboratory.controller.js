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
exports.LaboratoryController = void 0;
const common_1 = require("@nestjs/common");
const laboratory_service_1 = require("./laboratory.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const user_entity_1 = require("../users/entities/user.entity");
const swagger_1 = require("@nestjs/swagger");
let LaboratoryController = class LaboratoryController {
    constructor(laboratoryService) {
        this.laboratoryService = laboratoryService;
    }
    getCatalog() {
        return this.laboratoryService.getCatalog();
    }
    create(createDto) {
        return this.laboratoryService.create(createDto);
    }
    findAll() {
        return this.laboratoryService.findAll();
    }
    findByPatient(patientId, req) {
        return this.laboratoryService.findByPatientForRequester(patientId, req.user);
    }
    findOne(id, req) {
        return this.laboratoryService.findOneForRequester(id, req.user);
    }
    updateResult(id, resultData) {
        return this.laboratoryService.updateResult(id, resultData);
    }
};
exports.LaboratoryController = LaboratoryController;
__decorate([
    (0, common_1.Get)("catalog"),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.DOCTOR, user_entity_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({
        summary: "Get laboratory test catalog with reference ranges",
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], LaboratoryController.prototype, "getCatalog", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.DOCTOR, user_entity_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: "Prescribe a new laboratory test" }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], LaboratoryController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.DOCTOR, user_entity_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: "Get all laboratory tests" }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], LaboratoryController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)("patient/:patientId"),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.DOCTOR, user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.PATIENT),
    (0, swagger_1.ApiOperation)({ summary: "Get laboratory tests for a specific patient" }),
    __param(0, (0, common_1.Param)("patientId")),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], LaboratoryController.prototype, "findByPatient", null);
__decorate([
    (0, common_1.Get)(":id"),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.DOCTOR, user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.PATIENT),
    (0, swagger_1.ApiOperation)({ summary: "Get detailed laboratory test by ID" }),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], LaboratoryController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(":id/result"),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: "Submit laboratory test results" }),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], LaboratoryController.prototype, "updateResult", null);
exports.LaboratoryController = LaboratoryController = __decorate([
    (0, swagger_1.ApiTags)("laboratory"),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)("laboratory"),
    __metadata("design:paramtypes", [laboratory_service_1.LaboratoryService])
], LaboratoryController);
//# sourceMappingURL=laboratory.controller.js.map