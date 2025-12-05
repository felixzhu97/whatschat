import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { DatabaseModule } from './infrastructure/database/database.module';
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

@Module({
  imports: [
    // 配置模块
    ConfigModule.forRoot({
      isGlobal: true,
      load: [ConfigService.loadConfig],
      validate: (config) => ConfigService.validateConfig(config),
    }),
    // 速率限制模块
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1分钟
        limit: 100, // 100次请求
      },
    ]),
    // 数据库模块
    DatabaseModule,
    // 业务模块
    AuthModule,
    HealthModule,
    WebSocketModule,
    UsersModule,
    MessagesModule,
    ChatsModule,
    GroupsModule,
    CallsModule,
    StatusModule,
  ],
})
export class AppModule {}

