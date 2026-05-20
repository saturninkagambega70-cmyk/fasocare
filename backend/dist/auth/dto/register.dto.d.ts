import { UserRole } from "../../users/entities/user.entity";
export declare class RegisterDto {
    phone: string;
    password: string;
    name: string;
    gender?: string;
    role?: UserRole;
    roles?: UserRole[];
    licenseNumber?: string;
    bloodGroup?: string;
}
