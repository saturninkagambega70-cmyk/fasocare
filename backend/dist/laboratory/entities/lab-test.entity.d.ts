import { User } from "../../users/entities/user.entity";
export declare enum LabTestStatus {
    PENDING = "PENDING",
    COLLECTED = "COLLECTED",
    IN_PROGRESS = "IN_PROGRESS",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED"
}
export declare class LabTest {
    id: string;
    patient: User;
    prescribedBy: User;
    performedBy: User;
    testName: string;
    category: string;
    resultValue: string;
    notes: string;
    status: LabTestStatus;
    resultDate: Date;
    createdAt: Date;
    updatedAt: Date;
}
