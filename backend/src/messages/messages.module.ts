import { Module } from "@nestjs/common";
import { MessagesGateway } from "./messages.gateway";
import { MedicalModule } from "../medical/medical.module";

@Module({
  imports: [MedicalModule],
  providers: [MessagesGateway],
})
export class MessagesModule {}
