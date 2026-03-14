import { Resolver, Query, ResolveField, Parent, Int, Args } from "@nestjs/graphql";
import { UseGuards } from "@nestjs/common";
import { FeedService } from "@/application/services/feed.service";
import { GqlJwtAuthGuard } from "./gql-auth.guard";
import { CurrentGqlUser } from "./current-gql-user.decorator";
import { FeedPageType, FeedEntryType, PostType } from "./feed.types";
import { PostLoader } from "./post.loader";

function entryCreatedAt(value: unknown): string {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") return value;
  return String(value);
}

@Resolver(() => FeedEntryType)
export class FeedEntryResolver {
  constructor(private readonly postLoader: PostLoader) {}

  @ResolveField(() => PostType, { nullable: true })
  async post(@Parent() parent: FeedEntryType): Promise<PostType | null> {
    const loaded = await this.postLoader.load(parent.postId);
    if (!loaded) return null;
    return PostType.fromGql(loaded);
  }
}

@Resolver()
export class FeedResolver {
  constructor(
    private readonly feedService: FeedService,
    private readonly postLoader: PostLoader
  ) {}

  @Query(() => FeedPageType)
  @UseGuards(GqlJwtAuthGuard)
  async feed(
    @CurrentGqlUser() user: { id: string },
    @Args("limit", { type: () => Int, nullable: true, defaultValue: 20 }) limit: number,
    @Args("pageState", { nullable: true }) pageState?: string
  ): Promise<FeedPageType> {
    this.postLoader.setCurrentUserId(user.id);
    const data = await this.feedService.getFeed(user.id, limit, pageState);
    const page = new FeedPageType();
    page.pageState = data.pageState ?? null;
    page.entries = (data.entries ?? []).map((e) => {
      const entry = new FeedEntryType();
      entry.postId = e.postId;
      entry.authorId = e.authorId;
      entry.createdAt = entryCreatedAt(e.createdAt);
      entry.post = null;
      return entry;
    });
    return page;
  }
}
