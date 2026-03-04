import { Module } from '@nestjs/common';
import { ImageController } from './image.controller';
import { ImageService } from '@/application/services/image.service';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [AiModule],
  controllers: [ImageController],
  providers: [ImageService],
  exports: [ImageService],
})
export class ImageModule {}
