import { Injectable } from "@nestjs/common";
import type { IPostRepository, CreatePostInput, PostRow } from "@/domain/interfaces/repositories/post.repository.interface";
import { CassandraPostRepository } from "../../database/cassandra-post.repository";

@Injectable()
export class PostRepositoryAdapter implements IPostRepository {
  constructor(private readonly impl: CassandraPostRepository) {}

  insertPost(input: CreatePostInput): Promise<void> {
    return this.impl.insertPost(input);
  }

  getPostById(postId: string): Promise<PostRow | null> {
    return this.impl.getPostById(postId);
  }

  getPostsByUserId(
    userId: string,
    limit: number,
    pageState?: string
  ): Promise<{ rows: PostRow[]; pageState?: string }> {
    return this.impl.getPostsByUserId(userId, limit, pageState);
  }

  deletePost(postId: string, userId: string): Promise<void> {
    return this.impl.deletePost(postId, userId);
  }
}
