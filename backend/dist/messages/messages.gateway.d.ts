import { OnGatewayConnection, OnGatewayDisconnect } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { MedicalService } from "../medical/medical.service";
export declare class MessagesGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly medicalService;
    server: Server;
    constructor(medicalService: MedicalService);
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleJoin(client: Socket, userId: string): void;
    handleMessage(client: Socket, payload: {
        receiverId: string;
        content: string;
    }): Promise<void>;
}
