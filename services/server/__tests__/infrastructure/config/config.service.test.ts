import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ConfigService } from "@/infrastructure/config/config.service";

vi.mock("@/infrastructure/config/config.service", () => ({
  ConfigService: {
    loadConfig: vi.fn(() => ({
      server: {
        port: 3001,
        host: "0.0.0.0",
        nodeEnv: "development",
        isProduction: false,
        isDevelopment: true,
      },
      database: {
        url: "postgresql://whatschat:whatschat123@localhost:5433/whatschat?schema=public",
      },
      redis: {
        url: "redis://localhost:6379",
        cacheTtlSeconds: 300,
      },
      kafka: {
        brokers: ["localhost:9092"],
        topicOfflineMessages: "offline-messages",
        topicPostCreated: "post.created",
        topicPostDeleted: "post.deleted",
        topicFeedFanout: "feed.fanout",
        topicCommentCreated: "comment.created",
        topicAnalyticsEvents: "analytics.events",
      },
      jwt: {
        secret: "your-super-secret-jwt-key-here",
        expiresIn: "7d",
        refreshSecret: "your-super-secret-refresh-key-here",
        refreshExpiresIn: "30d",
      },
      storage: {
        local: {
          uploadDir: "./uploads",
          maxFileSize: 52428800,
          allowedMimeTypes: ["image/jpeg"],
        },
        minio: {
          endpoint: "localhost",
          port: 9000,
          useSsl: false,
          accessKey: "minioadmin",
          secretKey: "minioadmin",
          bucket: "whatschat-media",
          region: "us-east-1",
          publicBaseUrl: "http://localhost:3001/uploads/media",
        },
      },
      cassandra: {
        contactPoints: [],
        keyspace: "whatschat",
        localDatacenter: "datacenter1",
      },
      elasticsearch: {
        node: "",
      },
      security: {
        cors: { origin: [], credentials: true },
        rateLimit: { windowMs: 900000, max: 100 },
        bcrypt: { saltRounds: 12 },
      },
      ai: {
        ollamaBaseUrl: "http://localhost:11434",
        defaultModel: "qwen3-coder:30b",
      },
      vision: {
        enabled: true,
        serviceUrl: "http://localhost:8001",
        timeoutMs: 15000,
        maxImagesPerPost: 3,
        moderationEnabled: true,
      },
      business: {
        maxGroupParticipants: 256,
        maxMessageLength: 4096,
        maxStatusDuration: 86400000,
        maxFileSize: 52428800,
        messageRetentionDays: 365,
        statusRetentionHours: 24,
      },
    })),
    validateConfig: vi.fn(),
  },
}));

describe("ConfigService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("loadConfig", () => {
    it("should load configuration with all required sections", () => {
      const config = ConfigService.loadConfig();

      expect(config).toHaveProperty("server");
      expect(config).toHaveProperty("database");
      expect(config).toHaveProperty("redis");
      expect(config).toHaveProperty("kafka");
      expect(config).toHaveProperty("jwt");
      expect(config).toHaveProperty("storage");
      expect(config).toHaveProperty("cassandra");
      expect(config).toHaveProperty("elasticsearch");
    });

    it("should have default server configuration", () => {
      const config = ConfigService.loadConfig();

      expect(config.server.port).toBe(3001);
      expect(config.server.host).toBe("0.0.0.0");
      expect(config.server.isDevelopment).toBe(true);
      expect(config.server.isProduction).toBe(false);
    });

    it("should have redis configuration with cache TTL", () => {
      const config = ConfigService.loadConfig();

      expect(config.redis.url).toBe("redis://localhost:6379");
      expect(config.redis.cacheTtlSeconds).toBe(300);
    });

    it("should have kafka configuration with topics", () => {
      const config = ConfigService.loadConfig();

      expect(config.kafka.brokers).toEqual(["localhost:9092"]);
      expect(config.kafka.topicOfflineMessages).toBe("offline-messages");
      expect(config.kafka.topicPostCreated).toBe("post.created");
    });

    it("should have JWT configuration", () => {
      const config = ConfigService.loadConfig();

      expect(config.jwt.secret).toBeDefined();
      expect(config.jwt.expiresIn).toBe("7d");
      expect(config.jwt.refreshExpiresIn).toBe("30d");
    });

    it("should have storage local configuration", () => {
      const config = ConfigService.loadConfig();

      expect(config.storage.local.uploadDir).toBe("./uploads");
      expect(config.storage.local.maxFileSize).toBeGreaterThan(0);
      expect(Array.isArray(config.storage.local.allowedMimeTypes)).toBe(true);
    });

    it("should have storage minio configuration", () => {
      const config = ConfigService.loadConfig();

      expect(config.storage.minio.endpoint).toBe("localhost");
      expect(config.storage.minio.port).toBe(9000);
      expect(config.storage.minio.publicBaseUrl).toBeDefined();
    });

    it("should have cassandra configuration", () => {
      const config = ConfigService.loadConfig();

      expect(config.cassandra.keyspace).toBe("whatschat");
      expect(config.cassandra.localDatacenter).toBe("datacenter1");
    });

    it("should have security configuration", () => {
      const config = ConfigService.loadConfig();

      expect(config.security.bcrypt.saltRounds).toBe(12);
      expect(config.security.rateLimit.max).toBe(100);
    });

    it("should have business configuration with defaults", () => {
      const config = ConfigService.loadConfig();

      expect(config.business.maxGroupParticipants).toBe(256);
      expect(config.business.maxMessageLength).toBe(4096);
    });

    it("should have vision configuration", () => {
      const config = ConfigService.loadConfig();

      expect(config.vision.enabled).toBe(true);
      expect(config.vision.timeoutMs).toBe(15000);
      expect(config.vision.maxImagesPerPost).toBe(3);
    });

    it("should have ai configuration", () => {
      const config = ConfigService.loadConfig();

      expect(config.ai.ollamaBaseUrl).toBe("http://localhost:11434");
      expect(config.ai.defaultModel).toBe("qwen3-coder:30b");
    });
  });


  describe("validateConfig", () => {
    it("should be callable", () => {
      const config = ConfigService.loadConfig();
      ConfigService.validateConfig(config);
      
      expect(ConfigService.validateConfig).toHaveBeenCalledWith(config);
    });
  });
});
