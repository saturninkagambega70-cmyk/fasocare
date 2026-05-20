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
exports.VideoService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let VideoService = class VideoService {
    constructor(configService) {
        this.configService = configService;
    }
    async generateToken(identity, roomName) {
        const apiKey = this.configService.get("TWILIO_API_KEY") || "";
        const apiSecret = this.configService.get("TWILIO_API_SECRET") || "";
        if (!apiKey || !apiSecret) {
            throw new Error("TWILIO_API_KEY and TWILIO_API_SECRET are required");
        }
        console.log(`Generating Twilio Token for ${identity} in room ${roomName}`);
        return {
            token: `TWILIO-TOKEN-${identity}-${roomName}-${Date.now()}`,
            room: roomName,
        };
    }
};
exports.VideoService = VideoService;
exports.VideoService = VideoService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], VideoService);
//# sourceMappingURL=video.service.js.map