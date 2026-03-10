import { Module } from "@nestjs/common";
import { PostController } from "./post.controller";
import { PostService } from "../../application/services/post.service";
import { FeedService } from "../../application/services/feed.service";
import { EngagementService } from "../../application/services/engagement.service";
import { ExploreService } from "../../application/services/explore.service";
import { KafkaModule } from "../../infrastructure/messaging/kafka.module";
import { UsersModule } from "../users/users.module";

@Module({
  imports: [KafkaModule, UsersModule],
  controllers: [PostController],
  providers: [PostService, FeedService, EngagementService, ExploreService],
  exports: [PostService, FeedService, EngagementService, ExploreService],
})
export class PostModule {}
