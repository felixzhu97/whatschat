import { describe, it, expect, beforeEach, vi } from "vitest";
import { CassandraService } from "@/infrastructure/database/cassandra.service";
import { ConfigService } from "@/infrastructure/config/config.service";

vi.mock("@/infrastructure/config/config.service", () => ({
  ConfigService: {
    loadConfig: vi.fn(() => ({
      cassandra: {
        contactPoints: ["localhost:9042"],
        keyspace: "test_keyspace",
        localDatacenter: "datacenter1",
      },
    })),
  },
}));

describe("CassandraService", () => {
  let service: CassandraService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new CassandraService();
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
    it("should return the cassandra client instance", () => {
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
});
