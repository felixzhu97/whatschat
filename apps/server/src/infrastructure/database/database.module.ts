import { Module, Global, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { PrismaService } from "./prisma.service";
import { RedisService } from "./redis.service";
import { CacheService } from "../cache/cache.service";
import { FeedCacheService } from "../cache/feed-cache.service";
import { CassandraService } from "./cassandra.service";
import { MongoService } from "./mongo.service";
import { ElasticsearchService } from "./elasticsearch.service";
import { CassandraPostRepository } from "./cassandra-post.repository";
import { CassandraFeedRepository } from "./cassandra-feed.repository";
import { CassandraEngagementRepository } from "./cassandra-engagement.repository";
import { MongoCommentRepository } from "./mongo-comment.repository";

@Global()
@Module({
  providers: [
    PrismaService,
    RedisService,
    CacheService,
    FeedCacheService,
    CassandraService,
    MongoService,
    ElasticsearchService,
    CassandraPostRepository,
    CassandraFeedRepository,
    CassandraEngagementRepository,
    MongoCommentRepository,
  ],
  exports: [
    PrismaService,
    RedisService,
    CacheService,
    FeedCacheService,
    CassandraService,
    MongoService,
    ElasticsearchService,
    CassandraPostRepository,
    CassandraFeedRepository,
    CassandraEngagementRepository,
    MongoCommentRepository,
  ],
})
export class DatabaseModule implements OnModuleInit, OnModuleDestroy {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly cassandra: CassandraService,
    private readonly mongo: MongoService,
    private readonly elasticsearch: ElasticsearchService,
  ) {}

  async onModuleInit() {
    await this.prisma.onModuleInit();
    await this.redis.onModuleInit();
    await this.cassandra.onModuleInit();
    await this.mongo.onModuleInit();
    await this.elasticsearch.onModuleInit();
  }

  async onModuleDestroy() {
    await this.elasticsearch.onModuleDestroy();
    await this.mongo.onModuleDestroy();
    await this.cassandra.onModuleDestroy();
    await this.prisma.onModuleDestroy();
    await this.redis.onModuleDestroy();
  }
}

