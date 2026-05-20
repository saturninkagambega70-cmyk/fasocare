import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Inject,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Notification } from "../medical/entities/notification.entity";
import { TelecomService } from "../telecom/telecom.service";

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    @Inject(TelecomService)
    private telecomService?: TelecomService,
  ) {}

  async listNotifications(
    userId: string,
    limit: number = 10,
    unreadOnly: boolean = false,
  ) {
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

  async markAsRead(id: string, userId: string) {
    const notification = await this.notificationRepository.findOne({
      where: { id },
      relations: ["user"],
    });
    if (!notification) {
      throw new NotFoundException("Notification non trouvée");
    }
    if (notification.user?.id !== userId) {
      throw new ForbiddenException("Accès interdit à cette notification");
    }

    notification.isRead = true;
    await this.notificationRepository.save(notification);

    return {
      statusCode: 200,
      success: true,
      data: null,
    };
  }

  async markAllAsRead(userId: string) {
    await this.notificationRepository
      .createQueryBuilder()
      .update(Notification)
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

  async createNotification(
    data: Partial<Notification>,
    channel?: "in-app" | "sms" | "email" | "all",
  ) {
    const notification = this.notificationRepository.create(data);
    const saved = await this.notificationRepository.save(notification);

    if (channel === "sms" || channel === "all") {
      try {
        const phone = await this.getUserPhone(data.user?.id);
        if (phone && this.telecomService) {
          await this.telecomService.sendSms(
            phone,
            `[FasoCare] ${data.title}: ${data.content}`,
          );
        }
      } catch {}
    }

    return saved;
  }

  private async getUserPhone(userId?: string): Promise<string | null> {
    if (!userId) return null;
    try {
      const { User } = require("../users/entities/user.entity");
      const { getRepository } = require("typeorm");
      const repo = getRepository(User);
      const user = await repo.findOne({ where: { id: userId } });
      return user?.phone || null;
    } catch {
      return null;
    }
  }
}
