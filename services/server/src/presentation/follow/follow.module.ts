import { Module } from "@nestjs/common";
import { FollowController } from "./follow.controller";
import { FollowService } from "../../application/services/follow.service";

@Module({
  controllers: [FollowController],
  providers: [FollowService],
  exports: [FollowService],
})
export class FollowModule {}
