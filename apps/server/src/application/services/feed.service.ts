import { Injectable } from "@nestjs/common";
import { FeedCacheService } from "../../infrastructure/cache/feed-cache.service";
import { CassandraEngagementRepository } from "../../infrastructure/database/cassandra-engagement.repository";
import { PostService } from "./post.service";

const RECENCY_HALFLIFE_HOURS = 24;
const ENGAGEMENT_WEIGHT = 2;

function rankScore(
  createdAt: Date,
  likeCount: number,
  commentCount: number,
  now: Date
): number {
  const ageHours = (now.getTime() - new Date(createdAt).getTime()) / (1000 * 3600);
  const recency = Math.exp(-ageHours * Math.LN2 / RECENCY_HALFLIFE_HOURS);
  const engagement = Math.log(1 + likeCount + commentCount);
  return recency + ENGAGEMENT_WEIGHT * engagement;
}

@Injectable()
export class FeedService {
  constructor(
    private readonly feedCache: FeedCacheService,
    private readonly postService: PostService,
    private readonly engagementRepo: CassandraEngagementRepository,
  ) {}

  async getFeed(userId: string, limit: number, pageState?: string) {
    const result = await this.feedCache.getFeedPage(userId, limit, pageState);
    if (pageState) return result;
    const { posts } = await this.postService.getPostsByUser(userId, limit, undefined);
    const ownEntries = posts.map((p) => ({
      postId: p.postId,
      authorId: p.userId,
      createdAt: typeof p.createdAt === "string" ? new Date(p.createdAt) : (p.createdAt as Date),
    }));
    const byPost = new Map<string, { postId: string; authorId: string; createdAt: Date }>();
    for (const e of [...ownEntries, ...result.entries]) {
      if (!byPost.has(e.postId)) byPost.set(e.postId, e);
    }
    const merged = Array.from(byPost.values());
    const postIds = merged.map((e) => e.postId);
    const countsMap = await this.engagementRepo.getEngagementCountsBatch(postIds);
    const now = new Date();
    const withScore = merged.map((e) => ({
      ...e,
      score: rankScore(
        e.createdAt,
        countsMap.get(e.postId)?.likeCount ?? 0,
        countsMap.get(e.postId)?.commentCount ?? 0,
        now,
      ),
    }));
    withScore.sort((a, b) => b.score - a.score);
    const entries = withScore.slice(0, limit).map(({ postId, authorId, createdAt }) => ({
      postId,
      authorId,
      createdAt,
    }));
    return { entries, pageState: result.pageState };
  }
}
