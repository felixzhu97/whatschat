import { Module } from '@nestjs/common';
import { MessagesController } from './messages.controller';
import { MessagesService } from '../../application/services/messages.service';
import { DatabaseModule } from '../../infrastructure/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [MessagesController],
  providers: [MessagesService],
  exports: [MessagesService],
})
export class MessagesModule {}

