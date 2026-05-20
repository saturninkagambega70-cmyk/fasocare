import { User } from "../../users/entities/user.entity";
export declare class Message {
    id: string;
    sender: User;
    receiver: User;
    content: string;
    isRead: boolean;
    createdAt: Date;
}
