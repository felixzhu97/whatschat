import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentUser } from "../auth/current-user.decorator";
import { AnalyticsService } from "@/application/services/analytics.service";
import { IngestAnalyticsEventsDto } from "@/application/dto/analytics.dto";

@ApiTags("Analytics")
@Controller("analytics")
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post("events")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Ingest analytics events" })
  async ingestEvents(
    @Body() dto: IngestAnalyticsEventsDto,
    @CurrentUser() user: { id: string },
  ) {
    await this.analyticsService.ingest(dto.events, user.id);
    return { success: true };
  }
}
