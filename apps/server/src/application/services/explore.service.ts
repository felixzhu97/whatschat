import { Injectable } from "@nestjs/common";
import { RedisService } from "../../infrastructure/database/redis.service";
import { PrismaService } from "../../infrastructure/database/prisma.service";
import { CassandraPostRepository } from "../../infrastructure/database/cassandra-post.repository";
import { RecommendationService } from "./recommendation.service";
import { ExperimentService } from "./experiment.service";

const EXPLORE_HOT_KEY = "explore:hot";
const FALLBACK_USERS_LIMIT = 25;
const FALLBACK_POSTS_PER_USER = 12;

export interface ExploreEntryDto {
  postId: string;
  authorId: string;
  createdAt: string;
}

@Injectable()
export class ExploreService {
  constructor(
    private readonly redis: RedisService,
    private readonly prisma: PrismaService,
    private readonly postRepo: CassandraPostRepository,
    private readonly recommendation: RecommendationService,
    private readonly experiments: ExperimentService,
  ) {}

  async getExplore(
    userId: string,
    limit: number,
    offset: number
  ): Promise<{ entries: ExploreEntryDto[]; total: number }> {
    let raw = await this.redis.get<ExploreEntryDto[]>(EXPLORE_HOT_KEY);
    if (!Array.isArray(raw) || raw.length === 0) {
      raw = await this.getExploreFallback();
    }
    const following = await this.prisma.userFollow
      .findMany({
        where: { followerId: userId },
        select: { followingId: true },
      })
      .then((rows) => new Set(rows.map((r) => r.followingId)));
    const filtered = raw.filter((e) => !following.has(e.authorId));
    const assignment = this.experiments.assign(userId, "explore");
    const ranked = await this.recommendation.rankExplore({
      userId,
      candidateIds: filtered.map((e) => e.postId),
      limit: filtered.length,
      experimentId: assignment.experimentId,
      variantId: assignment.variantId,
    });
    const byPost = new Map(filtered.map((e) => [e.postId, e]));
    const ordered = ranked.items
      .map((item) => byPost.get(item.id))
      .filter((v): v is ExploreEntryDto => Boolean(v));
    const orderedOrFallback = ordered.length > 0 ? ordered : filtered;
    const total = orderedOrFallback.length;
    const page = orderedOrFallback.slice(offset, offset + limit);
    return { entries: page, total };
  }

  private async getExploreFallback(): Promise<ExploreEntryDto[]> {
    const users = await this.prisma.user.findMany({
      take: FALLBACK_USERS_LIMIT,
      select: { id: true },
    });
    const entries: ExploreEntryDto[] = [];
    for (const { id: authorId } of users) {
      const { rows } = await this.postRepo.getPostsByUserId(authorId, FALLBACK_POSTS_PER_USER);
      for (const row of rows) {
        entries.push({
          postId: row.post_id,
          authorId: row.user_id,
          createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
        });
      }
    }
    entries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return entries.slice(0, 500);
  }
}
