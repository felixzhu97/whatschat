import { Module } from "@nestjs/common";
import { CommentsController, CommentDeleteController } from "./comments.controller";
import { CommentService } from "../../application/services/comment.service";
import { KafkaModule } from "../../infrastructure/messaging/kafka.module";
import { NotificationsModule } from "../notifications/notifications.module";
import { WebSocketModule } from "../websocket/websocket.module";
import { AiModule } from "../ai/ai.module";

@Module({
  imports: [KafkaModule, NotificationsModule, WebSocketModule, AiModule],
  controllers: [CommentsController, CommentDeleteController],
  providers: [CommentService],
  exports: [CommentService],
})
export class CommentsModule {}
