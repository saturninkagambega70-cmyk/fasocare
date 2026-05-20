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
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const notification_entity_1 = require("../medical/entities/notification.entity");
const telecom_service_1 = require("../telecom/telecom.service");
let NotificationsService = class NotificationsService {
    constructor(notificationRepository, telecomService) {
        this.notificationRepository = notificationRepository;
        this.telecomService = telecomService;
    }
    async listNotifications(userId, limit = 10, unreadOnly = false) {
        const safeLimit = Number.isFinite(Number(limit))
            ? Math.min(Math.max(Number(limit), 1), 100)
            : 10;
        const query = this.notificationRepository
            .createQueryBuilder("n")
            .where("n.userId = :userId", { userId })
            .orderBy("n.createdAt", "DESC");
        if (unreadOnly) {
            query.andWhere("n.isRead = :isRead", { isRead: false });
        }
        const notifications = await query.take(safeLimit).getMany();
        const total = await query.getCount();
        return {
            statusCode: 200,
            success: true,
            data: {
                notifications: notifications.map((n) => ({
                    id: n.id,
                    type: n.type,
                    title: n.title,
                    content: n.content,
                    metadata: n.metadata,
                    timestamp: n.createdAt,
                    isRead: n.isRead,
                })),
                total,
            },
        };
    }
    async markAsRead(id, userId) {
        const notification = await this.notificationRepository.findOne({
            where: { id },
            relations: ["user"],
        });
        if (!notification) {
            throw new common_1.NotFoundException("Notification non trouvée");
        }
        if (notification.user?.id !== userId) {
            throw new common_1.ForbiddenException("Accès interdit à cette notification");
        }
        notification.isRead = true;
        await this.notificationRepository.save(notification);
        return {
            statusCode: 200,
            success: true,
            data: null,
        };
    }
    async markAllAsRead(userId) {
        await this.notificationRepository
            .createQueryBuilder()
            .update(notification_entity_1.Notification)
            .set({ isRead: true })
            .where("userId = :userId", { userId })
            .andWhere("isRead = :isRead", { isRead: false })
            .execute();
        return {
            statusCode: 200,
            success: true,
            data: null,
        };
    }
    async createNotification(data, channel) {
        const notification = this.notificationRepository.create(data);
        const saved = await this.notificationRepository.save(notification);
        if (channel === "sms" || channel === "all") {
            try {
                const phone = await this.getUserPhone(data.user?.id);
                if (phone && this.telecomService) {
                    await this.telecomService.sendSms(phone, `[FasoCare] ${data.title}: ${data.content}`);
                }
            }
            catch { }
        }
        return saved;
    }
    async getUserPhone(userId) {
        if (!userId)
            return null;
        try {
            const { User } = require("../users/entities/user.entity");
            const { getRepository } = require("typeorm");
            const repo = getRepository(User);
            const user = await repo.findOne({ where: { id: userId } });
            return user?.phone || null;
        }
        catch {
            return null;
        }
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(notification_entity_1.Notification)),
    __param(1, (0, common_1.Inject)(telecom_service_1.TelecomService)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        telecom_service_1.TelecomService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map