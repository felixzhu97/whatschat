import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { DatabaseModule } from './infrastructure/database/database.module';
import { ConfigService } from './infrastructure/config/config.service';
import { ChimeModule } from './infrastructure/services/chime/chime.module';
import { ApiGatewayWebSocketModule } from './infrastructure/services/apigateway/apigateway-websocket.module';
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
    // AWS service modules
    ChimeModule,
    ApiGatewayWebSocketModule,
    // Business modules
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

