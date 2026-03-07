import { Module } from "@nestjs/common";
import { PostController } from "./post.controller";
import { PostService } from "../../application/services/post.service";
import { FeedService } from "../../application/services/feed.service";
import { KafkaModule } from "../../infrastructure/messaging/kafka.module";
import { UsersModule } from "../users/users.module";

@Module({
  imports: [KafkaModule, UsersModule],
  controllers: [PostController],
  providers: [PostService, FeedService],
  exports: [PostService, FeedService],
})
export class PostModule {}
