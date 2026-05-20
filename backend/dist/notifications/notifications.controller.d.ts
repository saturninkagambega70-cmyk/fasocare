import { NotificationsService } from "./notifications.service";
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    listNotifications(req: any, limit?: number, unreadOnly?: boolean): Promise<{
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
    markAsRead(id: string, req: any): Promise<{
        statusCode: number;
        success: boolean;
        data: any;
    }>;
    markAllAsRead(req: any): Promise<{
        statusCode: number;
        success: boolean;
        data: any;
    }>;
}
