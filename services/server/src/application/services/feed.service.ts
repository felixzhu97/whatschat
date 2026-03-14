import { Injectable } from "@nestjs/common";
import { FeedCacheService } from "../../infrastructure/cache/feed-cache.service";
import { CassandraEngagementRepository } from "../../infrastructure/database/cassandra-engagement.repository";
import { PostService } from "./post.service";
import { RecommendationService } from "./recommendation.service";
import { ExperimentService } from "./experiment.service";

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
    private readonly recommendation: RecommendationService,
    private readonly experiments: ExperimentService,
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
    const mergedByPost = new Map<string, { postId: string; authorId: string; createdAt: Date }>();
    for (const e of [...ownEntries, ...result.entries]) {
      if (!mergedByPost.has(e.postId)) mergedByPost.set(e.postId, e);
    }
    const merged = Array.from(mergedByPost.values());
    const postIds = merged.map((e) => e.postId);
    const countsMap = await this.engagementRepo.getEngagementCountsBatch(postIds);
    const now = new Date();
    const assignment = this.experiments.assign(userId, "feed");
    const ranked = await this.recommendation.rankFeed({
      userId,
      candidateIds: merged.map((e) => e.postId),
      limit,
      experimentId: assignment.experimentId,
      variantId: assignment.variantId,
    });
    const rankedByPost = new Map<string, { postId: string; authorId: string; createdAt: Date }>();
    for (const e of merged) {
      rankedByPost.set(e.postId, e);
    }
    const ordered = ranked.items
      .map((item) => rankedByPost.get(item.id))
      .filter((v): v is { postId: string; authorId: string; createdAt: Date } => Boolean(v));
    const fallbackSorted = merged
      .map((e) => ({
        ...e,
        score: rankScore(
          e.createdAt,
          countsMap.get(e.postId)?.likeCount ?? 0,
          countsMap.get(e.postId)?.commentCount ?? 0,
          now,
        ),
      }))
      .sort((a, b) => b.score - a.score);
    const combined = ordered.length > 0 ? ordered : fallbackSorted;
    const entries = combined.slice(0, limit).map(({ postId, authorId, createdAt }) => ({
      postId,
      authorId,
      createdAt,
    }));
    return { entries, pageState: result.pageState };
  }
}
