import { ObjectType, Field, Int } from "@nestjs/graphql";
import { PostGql } from "./post.loader";

@ObjectType()
export class PostType {
  @Field(() => String)
  postId!: string;

  @Field(() => String)
  userId!: string;

  @Field(() => String)
  createdAt!: string;

  @Field(() => String, { nullable: true })
  caption!: string | null;

  @Field(() => String)
  type!: string;

  @Field(() => [String])
  mediaUrls!: string[];

  @Field(() => String, { nullable: true })
  location!: string | null;

  @Field(() => Int, { nullable: true })
  likeCount!: number | null;

  @Field(() => Int, { nullable: true })
  commentCount!: number | null;

  @Field(() => Int, { nullable: true })
  saveCount!: number | null;

  @Field(() => String, { nullable: true })
  username!: string | null;

  @Field(() => String, { nullable: true })
  avatar!: string | null;

  @Field(() => Boolean, { nullable: true })
  isLiked!: boolean | null;

  @Field(() => Boolean, { nullable: true })
  isSaved!: boolean | null;

  static fromGql(p: PostGql): PostType {
    const t = new PostType();
    t.postId = p.postId;
    t.userId = p.userId;
    t.createdAt = p.createdAt;
    t.caption = p.caption;
    t.type = p.type;
    t.mediaUrls = p.mediaUrls;
    t.location = (p.location as string | null) ?? null;
    t.likeCount = p.likeCount ?? null;
    t.commentCount = p.commentCount ?? null;
    t.saveCount = p.saveCount ?? null;
    t.username = p.username ?? null;
    t.avatar = p.avatar ?? null;
    t.isLiked = p.isLiked ?? null;
    t.isSaved = p.isSaved ?? null;
    return t;
  }
}

@ObjectType()
export class FeedEntryType {
  @Field(() => String)
  postId!: string;

  @Field(() => String)
  authorId!: string;

  @Field(() => String)
  createdAt!: string;

  @Field(() => PostType, { nullable: true })
  post!: PostType | null;
}

@ObjectType()
export class FeedPageType {
  @Field(() => [FeedEntryType])
  entries!: FeedEntryType[];

  @Field(() => String, { nullable: true })
  pageState!: string | null;
}
