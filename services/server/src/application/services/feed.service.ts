import { Injectable } from "@nestjs/common";
import { FeedCacheService } from "../../infrastructure/cache/feed-cache.service";
import { CassandraEngagementRepository } from "../../infrastructure/database/cassandra-engagement.repository";
import { PostService } from "./post.service";
import { RecommendationService } from "./recommendation.service";
import { ExperimentService } from "./experiment.service";
import { AdService, AdCandidate } from "./ad.service";

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
    private readonly ads: AdService,
  ) {}

  async getFeed(userId: string, limit: number, pageState?: string) {
    const result = await this.feedCache.getFeedPage(userId, limit, pageState);
    if (pageState) {
      return result;
    }
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
    const candidates = Array.from(mergedByPost.values());
    const postIds = candidates.map((e) => e.postId);
    const countsMap = await this.engagementRepo.getEngagementCountsBatch(postIds);
    const now = new Date();
    const assignment = this.experiments.assign(userId, "feed");
    const ranked = await this.recommendation.rankFeed({
      userId,
      candidateIds: candidates.map((e) => e.postId),
      limit,
      experimentId: assignment.experimentId,
      variantId: assignment.variantId,
    } as any);
    const rankedByPost = new Map<string, { postId: string; authorId: string; createdAt: Date }>();
    for (const e of candidates) {
      rankedByPost.set(e.postId, e);
    }
    const ordered = (ranked.items ?? [])
      .map((item) => rankedByPost.get(item.id))
      .filter((v): v is { postId: string; authorId: string; createdAt: Date } => Boolean(v));
    const fallbackSorted = candidates
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
    const page = combined.slice(0, limit).map(({ postId, authorId, createdAt }) => ({
      postId,
      authorId,
      createdAt,
    }));
    const mixed = await this.withAds(userId, page, limit);
    return { entries: mixed, pageState: result.pageState };
  }

  private async withAds(
    userId: string,
    entries: { postId: string; authorId: string; createdAt: Date }[],
    limit: number
  ): Promise<
    {
      postId: string;
      authorId: string;
      createdAt: Date;
      isSponsored?: boolean;
      adAccountId?: string;
      adCampaignId?: string;
      adGroupId?: string;
      adCreativeId?: string;
    }[]
  > {
    if (entries.length === 0) {
      return [];
    }
    const ads = await this.ads.getAdCandidates({
      userId,
      placement: "FEED",
      limit: Math.max(1, Math.floor(limit / 5)),
    });
    if (ads.length === 0) {
      return entries.map((e) => ({
        ...e,
        isSponsored: false,
      }));
    }
    const result: {
      postId: string;
      authorId: string;
      createdAt: Date;
      isSponsored?: boolean;
      adAccountId?: string;
      adCampaignId?: string;
      adGroupId?: string;
      adCreativeId?: string;
    }[] = [];
    const queue: AdCandidate[] = [...ads];
    const interval = Math.max(3, Math.floor(entries.length / queue.length));
    for (let i = 0; i < entries.length; i++) {
      const current = entries[i] as {
        postId: string;
        authorId: string;
        createdAt: Date;
      };
      result.push({
        postId: current.postId,
        authorId: current.authorId,
        createdAt: current.createdAt,
        isSponsored: false,
      });
      const shouldInsertAd = (i + 1) % interval === 0 && queue.length > 0 && result.length < limit + queue.length;
      if (shouldInsertAd) {
        const ad = queue.shift() as AdCandidate;
        result.push({
          postId: ad.creativeId,
          authorId: ad.accountId,
          createdAt: new Date(),
          isSponsored: true,
          adAccountId: ad.accountId,
          adCampaignId: ad.campaignId,
          adGroupId: ad.groupId,
          adCreativeId: ad.creativeId,
        });
      }
      if (result.length >= limit) {
        break;
      }
    }
    return result.slice(0, limit);
  }
}
