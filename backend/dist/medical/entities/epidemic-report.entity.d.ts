import { User } from "../../users/entities/user.entity";
export declare class EpidemicReport {
    id: string;
    doctor: User;
    disease: string;
    casesCount: number;
    location: string;
    notes: string;
    status: string;
    createdAt: Date;
}
