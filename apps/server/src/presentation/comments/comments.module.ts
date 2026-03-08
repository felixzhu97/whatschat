import { Module } from "@nestjs/common";
import { CommentsController, CommentDeleteController } from "./comments.controller";
import { CommentService } from "../../application/services/comment.service";
import { KafkaModule } from "../../infrastructure/messaging/kafka.module";

@Module({
  imports: [KafkaModule],
  controllers: [CommentsController, CommentDeleteController],
  providers: [CommentService],
  exports: [CommentService],
})
export class CommentsModule {}
