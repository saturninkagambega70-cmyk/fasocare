import { User } from "../../users/entities/user.entity";
export declare class Emergency {
    id: string;
    caller: User;
    description: string;
    latitude: string;
    longitude: string;
    address: string;
    status: "PENDING" | "ACKNOWLEDGED" | "RESOLVED" | "CANCELLED";
    priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    serviceType: string;
    createdAt: Date;
    acknowledgedAt: Date;
    resolvedAt: Date;
    notes: string;
}
