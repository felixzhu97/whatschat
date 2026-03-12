import { Injectable, NotFoundException } from "@nestjs/common";
import { CassandraPostRepository } from "../../infrastructure/database/cassandra-post.repository";
import { CassandraEngagementRepository } from "../../infrastructure/database/cassandra-engagement.repository";
import { KafkaProducerService } from "../../infrastructure/messaging/kafka-producer.service";
import { UsersService } from "./users.service";
import { v4 as uuidv4 } from "uuid";

export interface CreatePostData {
  caption: string;
  type: string;
  mediaUrls?: string[];
  location?: string;
  coverUrl?: string;
}

@Injectable()
export class PostService {
  constructor(
    private readonly postRepo: CassandraPostRepository,
    private readonly engagementRepo: CassandraEngagementRepository,
    private readonly kafka: KafkaProducerService,
    private readonly usersService: UsersService,
  ) {}

  async createPost(userId: string, data: CreatePostData) {
    const postId = uuidv4();
    const mediaUrls = data.mediaUrls ?? [];
    await this.postRepo.insertPost({
      postId,
      userId,
      caption: data.caption,
      type: data.type,
      mediaUrls,
      ...(data.location != null && data.location !== "" && { location: data.location }),
      ...(data.coverUrl != null && data.coverUrl !== "" && { coverUrl: data.coverUrl }),
    });
    const createdAt = new Date().toISOString();
    await this.kafka.sendPostCreated({
      postId,
      userId,
      createdAt,
      caption: data.caption,
      type: data.type,
      ...(data.location && data.location !== "" && { location: data.location }),
    });
    return { postId, userId, createdAt, ...data };
  }

  async getPost(postId: string, currentUserId?: string) {
    const row = await this.postRepo.getPostById(postId);
    if (!row) throw new NotFoundException("Post not found");
    let username: string | undefined;
    let avatar: string | undefined;
    try {
      const user = await this.usersService.getUserById(row.user_id);
      username = user?.username;
      avatar = user?.avatar ?? undefined;
    } catch {
      // author not found, leave username/avatar undefined
    }
    const counts = await this.engagementRepo.getEngagementCounts(postId);
    const result: Record<string, unknown> = {
      postId: row.post_id,
      userId: row.user_id,
      createdAt: row.created_at,
      caption: row.caption,
      type: row.type,
      mediaUrls: row.media_urls,
      location: row.location,
      ...(row.cover_url != null && row.cover_url !== "" && { coverUrl: row.cover_url }),
      likeCount: counts.likeCount,
      commentCount: counts.commentCount,
      saveCount: counts.saveCount,
      ...(username != null && { username }),
      ...(avatar != null && { avatar }),
    };
    if (currentUserId) {
      const [isLiked, isSaved] = await Promise.all([
        this.engagementRepo.isLiked(currentUserId, postId),
        this.engagementRepo.isSaved(currentUserId, postId),
      ]);
      result["isLiked"] = isLiked;
      result["isSaved"] = isSaved;
    }
    return result;
  }

  async getPostsByUser(userId: string, limit: number, pageState?: string) {
    const { rows, pageState: next } = await this.postRepo.getPostsByUserId(userId, limit, pageState);
    return {
      posts: rows.map((r) => ({
        postId: r.post_id,
        userId: r.user_id,
        createdAt: r.created_at,
        caption: r.caption,
        type: r.type,
        mediaUrls: r.media_urls,
        location: r.location,
        ...(r.cover_url != null && r.cover_url !== "" && { coverUrl: r.cover_url }),
      })),
      pageState: next,
    };
  }

  async deletePost(postId: string, userId: string) {
    const row = await this.postRepo.getPostById(postId);
    if (!row) throw new NotFoundException("Post not found");
    if (row.user_id !== userId) throw new NotFoundException("Forbidden");
    await this.postRepo.deletePost(postId, userId);
    await this.kafka.sendPostDeleted({ postId, userId });
    return { deleted: true };
  }
}
