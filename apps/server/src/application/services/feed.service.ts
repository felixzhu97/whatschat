import { Injectable } from "@nestjs/common";
import { FeedCacheService } from "../../infrastructure/cache/feed-cache.service";
import { PostService } from "./post.service";

@Injectable()
export class FeedService {
  constructor(
    private readonly feedCache: FeedCacheService,
    private readonly postService: PostService,
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
    const merged = Array.from(byPost.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
    return { entries: merged.slice(0, limit), pageState: result.pageState };
  }
}
