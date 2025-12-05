import { Module } from '@nestjs/common';
import { ChatsController } from './chats.controller';
import { ChatsService } from '../../application/services/chats.service';
import { DatabaseModule } from '../../infrastructure/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [ChatsController],
  providers: [ChatsService],
  exports: [ChatsService],
})
export class ChatsModule {}

