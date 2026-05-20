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
exports.ConsentService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const consent_entity_1 = require("./entities/consent.entity");
const users_service_1 = require("../users/users.service");
let ConsentService = class ConsentService {
    constructor(consentRepository, usersService) {
        this.consentRepository = consentRepository;
        this.usersService = usersService;
    }
    async grantConsent(patientId, consentType, metadata) {
        let consent = await this.consentRepository.findOne({
            where: { patient: { id: patientId }, consentType },
        });
        if (!consent) {
            consent = this.consentRepository.create({
                patient: { id: patientId },
                consentType,
            });
        }
        consent.isGranted = true;
        consent.grantedAt = new Date();
        consent.revokedAt = null;
        consent.ipAddress = metadata.ip;
        consent.userAgent = metadata.userAgent;
        return this.consentRepository.save(consent);
    }
    async revokeConsent(patientId, consentType) {
        const consent = await this.consentRepository.findOne({
            where: { patient: { id: patientId }, consentType },
        });
        if (!consent) {
            throw new common_1.NotFoundException(`Consent for type ${consentType} not found for this patient`);
        }
        consent.isGranted = false;
        consent.revokedAt = new Date();
        return this.consentRepository.save(consent);
    }
    async getPatientConsents(patientId) {
        return this.consentRepository.find({
            where: { patient: { id: patientId } },
        });
    }
    async requestDataDeletion(patientId) {
        await this.consentRepository.update({ patient: { id: patientId } }, { isGranted: false, revokedAt: new Date() });
        await this.usersService.anonymize(patientId);
    }
};
exports.ConsentService = ConsentService;
exports.ConsentService = ConsentService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(consent_entity_1.Consent)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        users_service_1.UsersService])
], ConsentService);
//# sourceMappingURL=consent.service.js.map