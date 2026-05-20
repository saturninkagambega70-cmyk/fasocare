import { User } from "../../users/entities/user.entity";
export declare enum NotificationType {
    PRESCRIPTION = "PRESCRIPTION",
    VACCINATION = "VACCINATION",
    MESSAGE = "MESSAGE",
    SYSTEM = "SYSTEM"
}
export declare class Notification {
    id: string;
    user: User;
    title: string;
    content: string;
    type: NotificationType;
    isRead: boolean;
    metadata: any;
    createdAt: Date;
}
