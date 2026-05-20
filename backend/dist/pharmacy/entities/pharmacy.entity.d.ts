import { User } from "../../users/entities/user.entity";
export declare class Pharmacy {
    id: string;
    name: string;
    location: string;
    phone: string;
    openingHours: string;
    isOpen: boolean;
    admin: User;
    createdAt: Date;
}
