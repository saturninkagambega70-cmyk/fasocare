import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { NotificationsController } from "./notifications.controller";
import { NotificationsService } from "./notifications.service";
import { Notification } from "../medical/entities/notification.entity";
import { TelecomModule } from "../telecom/telecom.module";

@Module({
  imports: [TypeOrmModule.forFeature([Notification]), TelecomModule],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
