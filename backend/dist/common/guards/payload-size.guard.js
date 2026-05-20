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
exports.PayloadSizeGuard = void 0;
const common_1 = require("@nestjs/common");
let PayloadSizeGuard = class PayloadSizeGuard {
    constructor(maxSizeInMB = 10) {
        this.maxSize = maxSizeInMB * 1024 * 1024;
    }
    canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const contentLength = parseInt(request.headers["content-length"] || "0", 10);
        if (contentLength > this.maxSize) {
            return false;
        }
        return true;
    }
};
exports.PayloadSizeGuard = PayloadSizeGuard;
exports.PayloadSizeGuard = PayloadSizeGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [Number])
], PayloadSizeGuard);
//# sourceMappingURL=payload-size.guard.js.map