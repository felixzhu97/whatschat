import { Injectable, NotFoundException } from "@nestjs/common";
import { MongoCommentRepository } from "../../infrastructure/database/mongo-comment.repository";
import { KafkaProducerService } from "../../infrastructure/messaging/kafka-producer.service";

@Injectable()
export class CommentService {
  constructor(
    private readonly commentRepo: MongoCommentRepository,
    private readonly kafka: KafkaProducerService,
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
    const ok = await this.commentRepo.deleteOne(commentId, userId);
    if (!ok) throw new NotFoundException("Comment not found or forbidden");
    return { deleted: true };
  }
}
