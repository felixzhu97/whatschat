import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '../../infrastructure/config/config.service';
import { ChatGateway } from './chat.gateway';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { OfflineMessageQueueService } from '../../application/services/offline-message-queue.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: () => {
        const config = ConfigService.loadConfig();
        return {
          secret: config.jwt.secret,
        };
      },
    }),
    DatabaseModule,
  ],
  providers: [OfflineMessageQueueService, ChatGateway],
  exports: [OfflineMessageQueueService, ChatGateway],
})
export class WebSocketModule {}

