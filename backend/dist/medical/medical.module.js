"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MedicalModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const medical_service_1 = require("./medical.service");
const medical_controller_1 = require("./medical.controller");
const consultation_entity_1 = require("./entities/consultation.entity");
const prescription_item_entity_1 = require("./entities/prescription-item.entity");
const epidemic_report_entity_1 = require("./entities/epidemic-report.entity");
const message_entity_1 = require("./entities/message.entity");
const notification_entity_1 = require("./entities/notification.entity");
const emergency_entity_1 = require("./entities/emergency.entity");
const treatment_log_entity_1 = require("./entities/treatment-log.entity");
const qr_service_1 = require("./qr.service");
const video_service_1 = require("./video.service");
const triage_service_1 = require("./triage.service");
const pharmacy_module_1 = require("../pharmacy/pharmacy.module");
const users_module_1 = require("../users/users.module");
let MedicalModule = class MedicalModule {
};
exports.MedicalModule = MedicalModule;
exports.MedicalModule = MedicalModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                consultation_entity_1.Consultation,
                prescription_item_entity_1.PrescriptionItem,
                epidemic_report_entity_1.EpidemicReport,
                message_entity_1.Message,
                notification_entity_1.Notification,
                emergency_entity_1.Emergency,
                treatment_log_entity_1.TreatmentLog,
            ]),
            (0, common_1.forwardRef)(() => pharmacy_module_1.PharmacyModule),
            (0, common_1.forwardRef)(() => users_module_1.UsersModule),
        ],
        providers: [medical_service_1.MedicalService, qr_service_1.QrService, video_service_1.VideoService, triage_service_1.TriageService],
        controllers: [medical_controller_1.MedicalController],
        exports: [medical_service_1.MedicalService, video_service_1.VideoService, qr_service_1.QrService],
    })
], MedicalModule);
//# sourceMappingURL=medical.module.js.map