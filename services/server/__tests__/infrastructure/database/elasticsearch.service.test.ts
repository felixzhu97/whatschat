import { describe, it, expect, beforeEach, vi } from "vitest";
import { ElasticsearchService } from "@/infrastructure/database/elasticsearch.service";
import { ConfigService } from "@/infrastructure/config/config.service";

vi.mock("@/infrastructure/config/config.service", () => ({
  ConfigService: {
    loadConfig: vi.fn(() => ({
      elasticsearch: {
        node: "http://localhost:9200",
        username: undefined,
        password: undefined,
      },
    })),
  },
}));

describe("ElasticsearchService", () => {
  let service: ElasticsearchService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new ElasticsearchService();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("constructor", () => {
    it("should load configuration from ConfigService", () => {
      expect(ConfigService.loadConfig).toHaveBeenCalled();
    });

    it("should create service instance", () => {
      expect(service).toBeDefined();
    });
  });

  describe("getClient", () => {
    it("should return the elasticsearch client", () => {
      const client = service.getClient();
      expect(client).toBeDefined();
    });
  });

  describe("isConnected", () => {
    it("should return connection status", () => {
      const status = service.isConnected();
      expect(typeof status).toBe("boolean");
    });
  });

  describe("indexUser", () => {
    it("should be callable with user payload", async () => {
      await expect(
        service.indexUser({
          id: "user123",
          username: "testuser",
          createdAt: "2024-01-01T00:00:00Z",
        })
      ).resolves.toBeUndefined();
    });
  });

  describe("deleteUser", () => {
    it("should be callable with user id", async () => {
      await expect(service.deleteUser("user123")).resolves.toBeUndefined();
    });
  });
});
