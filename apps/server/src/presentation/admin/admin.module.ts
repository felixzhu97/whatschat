import { Module } from "@nestjs/common";
import { AdminController } from "./admin.controller";
import { AdminService } from "@/application/services/admin.service";
import { UsersModule } from "../users/users.module";
import { AnalyticsModule } from "../analytics/analytics.module";

@Module({
  imports: [UsersModule, AnalyticsModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
