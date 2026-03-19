import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { DatabaseModule } from './infrastructure/database/database.module';
import { KafkaModule } from './infrastructure/messaging/kafka.module';
import { ConfigService } from './infrastructure/config/config.service';
import { AuthModule } from './presentation/auth/auth.module';
import { HealthModule } from './presentation/health/health.module';
import { WebSocketModule } from './presentation/websocket/websocket.module';
import { UsersModule } from './presentation/users/users.module';
import { MessagesModule } from './presentation/messages/messages.module';
import { ChatsModule } from './presentation/chats/chats.module';
import { GroupsModule } from './presentation/groups/groups.module';
import { CallsModule } from './presentation/calls/calls.module';
import { StatusModule } from './presentation/status/status.module';
import { AdminModule } from './presentation/admin/admin.module';
import { AnalyticsModule } from './presentation/analytics/analytics.module';
import { AiModule } from './presentation/ai/ai.module';
import { VideoModule } from './presentation/video/video.module';
import { ImageModule } from './presentation/image/image.module';
import { VisionModule } from './presentation/vision/vision.module';
import { VoiceModule } from './presentation/voice/voice.module';
import { PostModule } from './presentation/post/post.module';
import { MediaModule } from './presentation/media/media.module';
import { CommentsModule } from './presentation/comments/comments.module';
import { SearchModule } from './presentation/search/search.module';
import { FollowModule } from './presentation/follow/follow.module';
import { GraphqlModule } from './presentation/graphql/graphql.module';
import { NotificationsModule } from './presentation/notifications/notifications.module';
import { AdsModule } from './presentation/ads/ads.module';

@Module({
  imports: [
    // Configuration module
    ConfigModule.forRoot({
      isGlobal: true,
      load: [ConfigService.loadConfig],
      validate: (config) => ConfigService.validateConfig(config),
    }),
    // Rate limiting module
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests
      },
    ]),
    // Database module
    DatabaseModule,
    KafkaModule,
    AuthModule,
    HealthModule,
    WebSocketModule,
    UsersModule,
    MessagesModule,
    ChatsModule,
    GroupsModule,
    CallsModule,
    StatusModule,
    AdminModule,
    AnalyticsModule,
    AiModule,
    VideoModule,
    ImageModule,
    VisionModule,
    VoiceModule,
    PostModule,
    MediaModule,
    CommentsModule,
    SearchModule,
    FollowModule,
    GraphqlModule,
    NotificationsModule,
    AdsModule,
  ],
})
export class AppModule {}

