import { Module } from '@nestjs/common';
import { ChatsController } from './chats.controller';
import { DatabaseModule } from '../../infrastructure/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [ChatsController],
})
export class ChatsModule {}

