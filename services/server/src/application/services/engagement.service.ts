import { Injectable, NotFoundException } from "@nestjs/common";
import { CassandraEngagementRepository } from "../../infrastructure/database/cassandra-engagement.repository";
import { CassandraPostRepository } from "../../infrastructure/database/cassandra-post.repository";
import { NotificationService } from "./notification.service";
import { ChatGateway } from "../../presentation/websocket/chat.gateway";

@Injectable()
export class EngagementService {
  constructor(
    private readonly engagementRepo: CassandraEngagementRepository,
    private readonly postRepo: CassandraPostRepository,
    private readonly notificationService: NotificationService,
    private readonly chatGateway: ChatGateway,
  ) {}

  async like(userId: string, postId: string): Promise<{ liked: boolean }> {
    const post = await this.postRepo.getPostById(postId);
    if (!post) throw new NotFoundException("Post not found");
    const already = await this.engagementRepo.isLiked(userId, postId);
    if (already) return { liked: true };
    const ok = await this.engagementRepo.like(userId, postId);
    if (ok && post.user_id !== userId) {
      const item = await this.notificationService.upsertLike(post.user_id, userId, postId);
      if (item) this.chatGateway.emitNotification(post.user_id, item);
    }
    return { liked: ok };
  }

  async unlike(userId: string, postId: string): Promise<{ liked: boolean }> {
    const post = await this.postRepo.getPostById(postId);
    if (!post) throw new NotFoundException("Post not found");
    const ok = await this.engagementRepo.unlike(userId, postId);
    if (ok) await this.notificationService.deleteLike(userId, postId);
    return { liked: !ok };
  }

  async save(userId: string, postId: string): Promise<{ saved: boolean }> {
    const post = await this.postRepo.getPostById(postId);
    if (!post) throw new NotFoundException("Post not found");
    const already = await this.engagementRepo.isSaved(userId, postId);
    if (already) return { saved: true };
    const ok = await this.engagementRepo.save(userId, postId);
    return { saved: ok };
  }

  async unsave(userId: string, postId: string): Promise<{ saved: boolean }> {
    const post = await this.postRepo.getPostById(postId);
    if (!post) throw new NotFoundException("Post not found");
    const ok = await this.engagementRepo.unsave(userId, postId);
    return { saved: !ok };
  }

  async getEngagementCounts(postId: string) {
    return this.engagementRepo.getEngagementCounts(postId);
  }

  async isLiked(userId: string, postId: string): Promise<boolean> {
    return this.engagementRepo.isLiked(userId, postId);
  }

  async isSaved(userId: string, postId: string): Promise<boolean> {
    return this.engagementRepo.isSaved(userId, postId);
  }
}
