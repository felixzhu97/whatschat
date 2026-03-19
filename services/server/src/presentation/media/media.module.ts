import { Module } from "@nestjs/common";
import { MediaController } from "@/presentation/media/media.controller";
import { MediaService } from "@/application/services/media.service";
import { MinioService } from "@/infrastructure/storage/minio.service";

@Module({
  controllers: [MediaController],
  providers: [MediaService, MinioService],
  exports: [MediaService],
})
export class MediaModule {}
