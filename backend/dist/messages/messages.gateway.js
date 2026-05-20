"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagesGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
const medical_service_1 = require("../medical/medical.service");
let MessagesGateway = class MessagesGateway {
    constructor(medicalService) {
        this.medicalService = medicalService;
    }
    handleConnection(client) {
        const userId = client.handshake.query.userId;
        if (userId) {
            client.join(`user:${userId}`);
        }
    }
    handleDisconnect(client) {
        const userId = client.handshake.query.userId;
        if (userId) {
            client.leave(`user:${userId}`);
        }
    }
    handleJoin(client, userId) {
        client.join(`user:${userId}`);
    }
    async handleMessage(client, payload) {
        const userId = client.handshake.query.userId;
        if (!userId || !payload.receiverId || !payload.content?.trim())
            return;
        this.server.to(`user:${payload.receiverId}`).emit("new_message", {
            id: `temp_${Date.now()}`,
            sender: { id: userId },
            receiver: { id: payload.receiverId },
            content: payload.content,
            createdAt: new Date().toISOString(),
        });
    }
};
exports.MessagesGateway = MessagesGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], MessagesGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)("join"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String]),
    __metadata("design:returntype", void 0)
], MessagesGateway.prototype, "handleJoin", null);
__decorate([
    (0, websockets_1.SubscribeMessage)("send"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], MessagesGateway.prototype, "handleMessage", null);
exports.MessagesGateway = MessagesGateway = __decorate([
    (0, common_1.Injectable)(),
    (0, websockets_1.WebSocketGateway)({
        namespace: "/messages",
        cors: { origin: "*", credentials: true },
        pingTimeout: 60000,
        pingInterval: 25000,
    }),
    __metadata("design:paramtypes", [medical_service_1.MedicalService])
], MessagesGateway);
//# sourceMappingURL=messages.gateway.js.map