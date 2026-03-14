import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/infrastructure/database/prisma.service";
import type { AnalyticsEventDto } from "../dto/analytics.dto";

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async ingest(events: AnalyticsEventDto[], userId?: string): Promise<void> {
    if (events.length === 0) return;
    const data = events.map((e) => ({
      eventName: e.eventName,
      ...(e.properties != null && { properties: e.properties as object }),
      platform: e.context?.platform ?? null,
      sessionId: e.context?.sessionId ?? null,
      userId: userId ?? e.context?.userId ?? null,
    }));
    await this.prisma.analyticsEvent.createMany({ data });
  }

  async getOverview(start: Date, end: Date): Promise<{
    byEvent: { eventName: string; count: number }[];
    byDay: { date: string; count: number }[];
    total: number;
  }> {
    const [byEvent, byDay, total] = await Promise.all([
      this.prisma.analyticsEvent.groupBy({
        by: ["eventName"],
        where: { createdAt: { gte: start, lte: end } },
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
      }),
      this.getCountByDay(start, end),
      this.prisma.analyticsEvent.count({
        where: { createdAt: { gte: start, lte: end } },
      }),
    ]);
    return {
      byEvent: byEvent.map((r) => ({ eventName: r.eventName, count: r._count.id })),
      byDay,
      total,
    };
  }

  private async getCountByDay(
    start: Date,
    end: Date
  ): Promise<{ date: string; count: number }[]> {
    const result = await this.prisma.$queryRaw<
      { date: string; count: bigint }[]
    >`
      SELECT date_trunc('day', "createdAt")::date::text AS date, COUNT(*)::bigint AS count
      FROM analytics_events
      WHERE "createdAt" >= ${start} AND "createdAt" <= ${end}
      GROUP BY date_trunc('day', "createdAt")::date
      ORDER BY date
    `;
    return result.map((r) => ({ date: r.date, count: Number(r.count) }));
  }

  async getEvents(params: {
    start: Date;
    end: Date;
    page?: number;
    limit?: number;
    eventName?: string;
  }): Promise<{
    data: { id: string; eventName: string; userId: string | null; createdAt: Date; properties: unknown }[];
    total: number;
  }> {
    const { start, end, page = 1, limit = 20, eventName } = params;
    const where = {
      createdAt: { gte: start, lte: end },
      ...(eventName && { eventName }),
    };
    const [data, total] = await Promise.all([
      this.prisma.analyticsEvent.findMany({
        where,
        select: { id: true, eventName: true, userId: true, createdAt: true, properties: true },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.analyticsEvent.count({ where }),
    ]);
    return {
      data: data.map((r) => ({
        id: r.id,
        eventName: r.eventName,
        userId: r.userId,
        createdAt: r.createdAt,
        properties: r.properties,
      })),
      total,
    };
  }
}
