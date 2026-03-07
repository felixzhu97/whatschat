import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { Kafka, Consumer } from "kafkajs";
import { ConfigService } from "../config/config.service";
import { RedisService } from "../database/redis.service";
import { PrismaService } from "../database/prisma.service";
import { CassandraFeedRepository } from "../database/cassandra-feed.repository";
import { CacheService } from "../cache/cache.service";
import { ElasticsearchService } from "../database/elasticsearch.service";
import logger from "@/shared/utils/logger";

const OFFLINE_KEY_PREFIX = "offline:";
const FEED_CACHE_KEY_PREFIX = "feed:";

@Injectable()
export class KafkaConsumerService implements OnModuleInit, OnModuleDestroy {
  private kafka: Kafka | null = null;
  private consumer: Consumer | null = null;
  private feedConsumer: Consumer | null = null;
  private readonly config: ReturnType<typeof ConfigService.loadConfig>;
  private readonly enabled: boolean;

  constructor(
    private readonly redis: RedisService,
    private readonly prisma: PrismaService,
    private readonly feedRepo: CassandraFeedRepository,
    private readonly cache: CacheService,
    private readonly elasticsearch: ElasticsearchService,
  ) {
    this.config = ConfigService.loadConfig();
    this.enabled = this.config.kafka.brokers.length > 0;
    if (this.enabled) {
      this.kafka = new Kafka({
        clientId: "whatschat-server",
        brokers: this.config.kafka.brokers,
      });
      this.consumer = this.kafka.consumer({ groupId: "offline-messages-consumer" });
      this.feedConsumer = this.kafka.consumer({ groupId: "post-created-consumer" });
    }
  }

  async onModuleInit() {
    if (!this.enabled || !this.consumer) return;
    try {
      await this.consumer.connect();
      await this.consumer.subscribe({ topic: this.config.kafka.topicOfflineMessages, fromBeginning: false });
      await this.consumer.run({
        eachMessage: async ({ message }: { message: { key?: Buffer | null; value?: Buffer | null } }) => {
          const userId = message.key?.toString();
          const value = message.value?.toString();
          if (!userId || !value) return;
          try {
            await this.redis.rpush(`${OFFLINE_KEY_PREFIX}${userId}`, value);
          } catch (err) {
            logger.error(`Kafka consumer Redis rpush error: ${err}`);
          }
        },
      });
      logger.info("Kafka consumer subscribed to offline-messages");
    } catch (err) {
      logger.warn(`Kafka consumer connect failed: ${err}`);
    }

    if (this.feedConsumer) {
      try {
        await this.feedConsumer.connect();
        await this.feedConsumer.subscribe({ topic: this.config.kafka.topicPostCreated, fromBeginning: false });
        await this.feedConsumer.run({
          eachMessage: async ({ message }: { message: { key?: Buffer | null; value?: Buffer | null } }) => {
            const value = message.value?.toString();
            if (!value) return;
            try {
              const payload = JSON.parse(value) as {
                postId: string;
                userId: string;
                createdAt: string;
                caption: string;
                type: string;
                mediaUrls?: string[];
                location?: string;
              };
              const followers = await this.prisma.userFollow.findMany({
                where: { followingId: payload.userId },
                select: { followerId: true },
              });
              const createdAt = new Date(payload.createdAt);
              await this.feedRepo.insertFeedEntry(payload.userId, payload.userId, payload.postId, createdAt);
              await this.cache.del(`${FEED_CACHE_KEY_PREFIX}${payload.userId}`);
              for (const f of followers) {
                await this.feedRepo.insertFeedEntry(f.followerId, payload.userId, payload.postId, createdAt);
                await this.cache.del(`${FEED_CACHE_KEY_PREFIX}${f.followerId}`);
              }
              const es = this.elasticsearch.getClient();
              if (es) {
                await es.index({
                  index: "posts",
                  id: payload.postId,
                  document: {
                    postId: payload.postId,
                    userId: payload.userId,
                    caption: payload.caption,
                    type: payload.type,
                    hashtags: (payload.caption || "").match(/#\w+/g) || [],
                    createdAt: payload.createdAt,
                  },
                });
              }
            } catch (err) {
              logger.error(`Kafka post.created consumer error: ${err}`);
            }
          },
        });
        logger.info("Kafka consumer subscribed to post.created");
      } catch (err) {
        logger.warn(`Kafka feed consumer connect failed: ${err}`);
      }
    }
  }

  async onModuleDestroy() {
    if (this.feedConsumer) {
      await this.feedConsumer.disconnect();
      this.feedConsumer = null;
    }
    if (this.consumer) {
      await this.consumer.disconnect();
      logger.info("Kafka consumer disconnected");
    }
  }
}
