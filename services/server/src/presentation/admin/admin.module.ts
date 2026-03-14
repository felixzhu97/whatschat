import { Module } from "@nestjs/common";
import { DatabaseModule } from "@/infrastructure/database/database.module";
import { AdminController } from "./admin.controller";
import { AdminService } from "@/application/services/admin.service";
import { UsersModule } from "../users/users.module";
import { AnalyticsModule } from "../analytics/analytics.module";

@Module({
  imports: [DatabaseModule, UsersModule, AnalyticsModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
