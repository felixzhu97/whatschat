import { Module, Global } from '@nestjs/common';
import { ApiGatewayWebSocketService } from './apigateway-websocket.service';
import { DatabaseModule } from '../../database/database.module';

@Global()
@Module({
  imports: [DatabaseModule],
  providers: [ApiGatewayWebSocketService],
  exports: [ApiGatewayWebSocketService],
})
export class ApiGatewayWebSocketModule {}
