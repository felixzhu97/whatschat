import { Module } from "@nestjs/common";
import { PostController } from "./post.controller";
import { PostService } from "../../application/services/post.service";
import { FeedService } from "../../application/services/feed.service";
import { EngagementService } from "../../application/services/engagement.service";
import { ExploreService } from "../../application/services/explore.service";
import { RecommendationService } from "../../application/services/recommendation.service";
import { ExperimentService } from "../../application/services/experiment.service";
import { AdService } from "../../application/services/ad.service";
import { AdTargetingService } from "../../application/services/ad-targeting.service";
import { AdPacingService } from "../../application/services/ad-pacing.service";
import { AdCreativeService } from "../../application/services/ad-creative.service";
import { FeedSeenService } from "../../application/services/feed-seen.service";
import { KafkaModule } from "../../infrastructure/messaging/kafka.module";
import { UsersModule } from "../users/users.module";
import { NotificationsModule } from "../notifications/notifications.module";
import { WebSocketModule } from "../websocket/websocket.module";
import { AiModule } from "../ai/ai.module";
import { VisionModule } from "../vision/vision.module";

@Module({
  imports: [KafkaModule, UsersModule, NotificationsModule, WebSocketModule, AiModule, VisionModule],
  controllers: [PostController],
  providers: [
    PostService,
    FeedService,
    FeedSeenService,
    EngagementService,
    ExploreService,
    RecommendationService,
    ExperimentService,
    AdService,
    AdTargetingService,
    AdPacingService,
    AdCreativeService,
  ],
  exports: [
    PostService,
    FeedService,
    FeedSeenService,
    EngagementService,
    ExploreService,
    RecommendationService,
    ExperimentService,
    AdService,
    AdTargetingService,
    AdPacingService,
    AdCreativeService,
  ],
})
export class PostModule {}
