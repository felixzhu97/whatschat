import { Body, Controller, Post } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { Public } from "../auth/public.decorator";
import { CurrentUser } from "../auth/current-user.decorator";
import { AnalyticsService } from "@/application/services/analytics.service";
import { IngestAnalyticsEventsDto } from "@/application/dto/analytics.dto";

@ApiTags("Analytics")
@Controller("analytics")
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post("events")
  @Public()
  @ApiOperation({ summary: "Ingest analytics events" })
  async ingestEvents(
    @Body() dto: IngestAnalyticsEventsDto,
    @CurrentUser() user?: { id: string },
  ) {
    const userId = user?.id;
    await this.analyticsService.ingest(dto.events, userId);
    return { success: true };
  }
}
