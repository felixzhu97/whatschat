import { Module } from "@nestjs/common";
import { VisionController } from "./vision.controller";
import { VisionClientService } from "@/application/services/vision-client.service";

@Module({
  controllers: [VisionController],
  providers: [VisionClientService],
  exports: [VisionClientService],
})
export class VisionModule {}
