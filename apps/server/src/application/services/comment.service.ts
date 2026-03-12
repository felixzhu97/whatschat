import { Injectable, NotFoundException } from "@nestjs/common";
import { MongoCommentRepository } from "../../infrastructure/database/mongo-comment.repository";
import { CassandraEngagementRepository } from "../../infrastructure/database/cassandra-engagement.repository";
import { CassandraPostRepository } from "../../infrastructure/database/cassandra-post.repository";
import { KafkaProducerService } from "../../infrastructure/messaging/kafka-producer.service";
import { NotificationService } from "./notification.service";
import { ChatGateway } from "../../presentation/websocket/chat.gateway";

@Injectable()
export class CommentService {
  constructor(
    private readonly commentRepo: MongoCommentRepository,
    private readonly engagementRepo: CassandraEngagementRepository,
    private readonly postRepo: CassandraPostRepository,
    private readonly kafka: KafkaProducerService,
    private readonly notificationService: NotificationService,
    private readonly chatGateway: ChatGateway,
  ) {}

  async create(postId: string, userId: string, content: string, parentId?: string) {
    const id = await this.commentRepo.insert({
      postId,
      userId,
      content,
      ...(parentId !== undefined && { parentId }),
    });
    const now = new Date().toISOString();
    await this.kafka.sendCommentCreated({ commentId: id, postId, userId, content, createdAt: now });
    await this.engagementRepo.incrementCommentCount(postId);
    const post = await this.postRepo.getPostById(postId);
    if (post && post.user_id !== userId) {
      const item = await this.notificationService.insertComment(
        post.user_id,
        userId,
        postId,
        id,
        content,
      );
      if (item) this.chatGateway.emitNotification(post.user_id, item);
    }
    return { id, postId, userId, content, parentId, createdAt: now };
  }

  async findByPostId(postId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const list = await this.commentRepo.findByPostId(postId, limit, skip);
    return list.map((doc) => ({
      id: doc._id?.toString(),
      postId: doc.postId,
      userId: doc.userId,
      content: doc.content,
      parentId: doc.parentId,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }));
  }

  async delete(commentId: string, userId: string) {
    const comment = await this.commentRepo.findById(commentId);
    if (!comment) throw new NotFoundException("Comment not found or forbidden");
    const ok = await this.commentRepo.deleteOne(commentId, userId);
    if (!ok) throw new NotFoundException("Comment not found or forbidden");
    await this.engagementRepo.decrementCommentCount(comment.postId);
    await this.notificationService.deleteByCommentId(commentId);
    return { deleted: true };
  }
}
