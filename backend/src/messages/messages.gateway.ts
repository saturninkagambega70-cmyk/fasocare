import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { Injectable } from "@nestjs/common";
import { MedicalService } from "../medical/medical.service";

@Injectable()
@WebSocketGateway({
  namespace: "/messages",
  cors: { origin: "*", credentials: true },
  pingTimeout: 60000,
  pingInterval: 25000,
})
export class MessagesGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  constructor(private readonly medicalService: MedicalService) {}

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      client.join(`user:${userId}`);
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      client.leave(`user:${userId}`);
    }
  }

  @SubscribeMessage("join")
  handleJoin(client: Socket, userId: string) {
    client.join(`user:${userId}`);
  }

  @SubscribeMessage("send")
  async handleMessage(
    client: Socket,
    payload: { receiverId: string; content: string },
  ) {
    const userId = client.handshake.query.userId as string;
    if (!userId || !payload.receiverId || !payload.content?.trim()) return;

    this.server.to(`user:${payload.receiverId}`).emit("new_message", {
      id: `temp_${Date.now()}`,
      sender: { id: userId },
      receiver: { id: payload.receiverId },
      content: payload.content,
      createdAt: new Date().toISOString(),
    });
  }
}
