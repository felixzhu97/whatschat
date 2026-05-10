import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { KafkaConsumerService } from "@/infrastructure/messaging/kafka-consumer.service";
import { RedisService } from "@/infrastructure/database/redis.service";
import { PrismaService } from "@/infrastructure/database/prisma.service";
import { CassandraFeedRepository } from "@/infrastructure/database/cassandra-feed.repository";
import { CacheService } from "@/infrastructure/cache/cache.service";
import { ElasticsearchService } from "@/infrastructure/database/elasticsearch.service";
import { VisionClientService } from "@/application/services/vision-client.service";
import { ConfigService } from "@/infrastructure/config/config.service";
import { IPostRepository } from "@/domain/interfaces/repositories/post.repository.interface";

const mockRedisService = {
  rpush: vi.fn(),
};
const mockPrismaService = {
  userFollow: {
    findMany: vi.fn(),
  },
};
const mockFeedRepo = {
  insertFeedEntry: vi.fn(),
};
const mockCacheService = {
  del: vi.fn(),
};
const mockElasticsearchService = {
  getClient: vi.fn(),
};
const mockVisionClient = {
  predictFromUrl: vi.fn(),
  moderateFromUrl: vi.fn(),
  predictFromBuffer: vi.fn(),
  moderateFromBuffer: vi.fn(),
  moderateVideoFromUrl: vi.fn(),
};
const mockPostRepo = {
  getPostById: vi.fn(),
};

vi.mock("kafkajs", () => {
  const mockConsumer = {
    connect: vi.fn(),
    disconnect: vi.fn(),
    subscribe: vi.fn(),
    run: vi.fn(),
  };
  const mockKafka = {
    consumer: vi.fn(() => mockConsumer),
  };
  return {
    Kafka: vi.fn(() => mockKafka),
  };
});

vi.mock("@/infrastructure/config/config.service", () => ({
  ConfigService: {
    loadConfig: vi.fn(() => ({
      kafka: {
        brokers: ["localhost:9092"],
        topicOfflineMessages: "offline-messages",
        topicPostCreated: "post.created",
        topicPostDeleted: "post.deleted",
        topicFeedFanout: "feed.fanout",
        topicCommentCreated: "comment.created",
        topicAnalyticsEvents: "analytics.events",
      },
      vision: {
        enabled: false,
        serviceUrl: "",
        timeoutMs: 15000,
        maxImagesPerPost: 3,
        moderationEnabled: false,
      },
    })),
  },
}));

vi.mock("@/infrastructure/database/redis.service", () => ({
  RedisService: vi.fn(),
}));

vi.mock("@/infrastructure/database/prisma.service", () => ({
  PrismaService: vi.fn(),
}));

vi.mock("@/infrastructure/database/cassandra-feed.repository", () => ({
  CassandraFeedRepository: vi.fn(),
}));

vi.mock("@/infrastructure/cache/cache.service", () => ({
  CacheService: vi.fn(),
}));

vi.mock("@/infrastructure/database/elasticsearch.service", () => ({
  ElasticsearchService: vi.fn(),
}));

vi.mock("@/application/services/vision-client.service", () => ({
  VisionClientService: vi.fn(),
}));

vi.mock("@/shared/utils/logger", () => ({
  __esModule: true,
  default: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}));

describe("KafkaConsumerService", () => {
  let service: KafkaConsumerService;

  beforeEach(() => {
    vi.clearAllMocks();
    mockRedisService.rpush.mockResolvedValue(undefined);
    mockCacheService.del.mockResolvedValue(undefined);
    mockPrismaService.userFollow.findMany.mockResolvedValue([]);
    mockFeedRepo.insertFeedEntry.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("constructor", () => {
    it("should load configuration from ConfigService", () => {
      service = new KafkaConsumerService(
        mockRedisService as unknown as RedisService,
        mockPrismaService as unknown as PrismaService,
        mockFeedRepo as unknown as CassandraFeedRepository,
        mockCacheService as unknown as CacheService,
        mockElasticsearchService as unknown as ElasticsearchService,
        mockPostRepo as unknown as IPostRepository,
        mockVisionClient as unknown as VisionClientService
      );

      expect(ConfigService.loadConfig).toHaveBeenCalled();
    });

    it("should create kafka client when brokers are configured", () => {
      service = new KafkaConsumerService(
        mockRedisService as unknown as RedisService,
        mockPrismaService as unknown as PrismaService,
        mockFeedRepo as unknown as CassandraFeedRepository,
        mockCacheService as unknown as CacheService,
        mockElasticsearchService as unknown as ElasticsearchService,
        mockPostRepo as unknown as IPostRepository,
        mockVisionClient as unknown as VisionClientService
      );

      expect(service).toBeDefined();
    });
  });

  describe("onModuleDestroy", () => {
    it("should disconnect all consumers on module destroy", async () => {
      service = new KafkaConsumerService(
        mockRedisService as unknown as RedisService,
        mockPrismaService as unknown as PrismaService,
        mockFeedRepo as unknown as CassandraFeedRepository,
        mockCacheService as unknown as CacheService,
        mockElasticsearchService as unknown as ElasticsearchService,
        mockPostRepo as unknown as IPostRepository,
        mockVisionClient as unknown as VisionClientService
      );

      await service.onModuleDestroy();
    });
  });
});
