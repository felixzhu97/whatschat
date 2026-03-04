import { Module } from '@nestjs/common';
import { VideoController } from './video.controller';
import { VideoService } from '@/application/services/video.service';

@Module({
  controllers: [VideoController],
  providers: [VideoService],
  exports: [VideoService],
})
export class VideoModule {}
