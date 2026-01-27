import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '../../infrastructure/config/config.service';
import { ChatGateway } from './chat.gateway';
import { ChimeGateway } from './chime.gateway';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { ChimeModule } from '../../infrastructure/services/chime/chime.module';
import { ApiGatewayWebSocketModule } from '../../infrastructure/services/apigateway/apigateway-websocket.module';

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
    ChimeModule,
    ApiGatewayWebSocketModule,
  ],
  providers: [ChatGateway, ChimeGateway],
  exports: [ChatGateway, ChimeGateway],
})
export class WebSocketModule {}

