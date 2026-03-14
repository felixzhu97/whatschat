import { Module } from '@nestjs/common';
import { MessagesController } from './messages.controller';
import { MessagesService } from '@/application/services/messages.service';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { WebSocketModule } from '../websocket/websocket.module';

@Module({
  imports: [DatabaseModule, WebSocketModule],
  controllers: [MessagesController],
  providers: [MessagesService],
  exports: [MessagesService],
})
export class MessagesModule {}

