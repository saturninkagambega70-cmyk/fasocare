import { Repository } from "typeorm";
import { Notification } from "../medical/entities/notification.entity";
import { TelecomService } from "../telecom/telecom.service";
export declare class NotificationsService {
    private notificationRepository;
    private telecomService?;
    constructor(notificationRepository: Repository<Notification>, telecomService?: TelecomService);
    listNotifications(userId: string, limit?: number, unreadOnly?: boolean): Promise<{
        statusCode: number;
        success: boolean;
        data: {
            notifications: {
                id: string;
                type: import("../medical/entities/notification.entity").NotificationType;
                title: string;
                content: string;
                metadata: any;
                timestamp: Date;
                isRead: boolean;
            }[];
            total: number;
        };
    }>;
    markAsRead(id: string, userId: string): Promise<{
        statusCode: number;
        success: boolean;
        data: any;
    }>;
    markAllAsRead(userId: string): Promise<{
        statusCode: number;
        success: boolean;
        data: any;
    }>;
    createNotification(data: Partial<Notification>, channel?: "in-app" | "sms" | "email" | "all"): Promise<Notification>;
    private getUserPhone;
}
