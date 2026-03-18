import { Module } from "@nestjs/common";
import { AnalyticsController } from "./analytics.controller";
import { AnalyticsService } from "@/application/services/analytics.service";
import { DatabaseModule } from "@/infrastructure/database/database.module";
import { FeedSeenService } from "@/application/services/feed-seen.service";

@Module({
  imports: [DatabaseModule],
  controllers: [AnalyticsController],
  providers: [AnalyticsService, FeedSeenService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
