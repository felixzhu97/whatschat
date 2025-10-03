import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import SocketManager from "@/services/socket-manager";

// Mock dependencies
vi.mock("socket.io");
vi.mock("@/config", () => ({
  default: {
    security: {
      cors: {
        origin: "http://localhost:3000",
      },
    },
  },
}));

vi.mock("@/utils/logger", () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

describe("SocketManager", () => {
  let mockHttpServer: any;
  let mockIO: any;
  let mockSocket: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Reset SocketManager singleton
    (SocketManager as any).instance = undefined;

    // Mock HTTP Server
    mockHttpServer = {
      listen: vi.fn(),
      close: vi.fn(),
    };

    // Mock Socket.IO Server
    mockIO = {
      on: vi.fn(),
      emit: vi.fn(),
      to: vi.fn(() => ({
        emit: vi.fn(),
      })),
    };

    // Mock Socket
    mockSocket = {
      id: "socket-123",
      join: vi.fn(),
      leave: vi.fn(),
      emit: vi.fn(),
      on: vi.fn(),
      disconnect: vi.fn(),
    };

    // Mock Server constructor
    vi.mocked(Server).mockImplementation(() => mockIO as any);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("Singleton pattern", () => {
    it("should return the same instance", () => {
      const instance1 = SocketManager.getInstance();
      const instance2 = SocketManager.getInstance();

      expect(instance1).toBe(instance2);
    });

    it("should create new instance only once", () => {
      const instance1 = SocketManager.getInstance();
      const instance2 = SocketManager.getInstance();

      expect(instance1).toBe(instance2);
    });
  });

  describe("initialize", () => {
    it("should initialize Socket.IO server with correct configuration", () => {
      const manager = SocketManager.getInstance();

      const result = manager.initialize(mockHttpServer as HttpServer);

      expect(Server).toHaveBeenCalledWith(mockHttpServer, {
        cors: {
          origin: "http://localhost:3000",
          credentials: true,
        },
        transports: ["websocket", "polling"],
      });

      expect(result).toBe(mockIO);
    });

    it("should setup event handlers after initialization", () => {
      const manager = SocketManager.getInstance();

      manager.initialize(mockHttpServer as HttpServer);

      expect(mockIO.on).toHaveBeenCalledWith(
        "connection",
        expect.any(Function)
      );
    });
  });

  describe("getIO", () => {
    it("should return Socket.IO instance when initialized", () => {
      const manager = SocketManager.getInstance();

      manager.initialize(mockHttpServer as HttpServer);
      const io = manager.getIO();

      expect(io).toBe(mockIO);
    });

    it("should throw error when not initialized", () => {
      const manager = SocketManager.getInstance();

      expect(() => manager.getIO()).toThrow(
        "Socket.IO not initialized. Call initialize() first."
      );
    });
  });

  describe("event handlers", () => {
    it("should handle connection event", () => {
      const manager = SocketManager.getInstance();

      manager.initialize(mockHttpServer as HttpServer);

      // Get the connection handler
      const connectionHandler = mockIO.on.mock.calls.find(
        (call) => call[0] === "connection"
      )[1];

      connectionHandler(mockSocket);

      expect(mockSocket.on).toHaveBeenCalledWith(
        "join-room",
        expect.any(Function)
      );
      expect(mockSocket.on).toHaveBeenCalledWith(
        "leave-room",
        expect.any(Function)
      );
      expect(mockSocket.on).toHaveBeenCalledWith(
        "disconnect",
        expect.any(Function)
      );
    });

    it("should handle join-room event", () => {
      const manager = SocketManager.getInstance();

      manager.initialize(mockHttpServer as HttpServer);

      const connectionHandler = mockIO.on.mock.calls.find(
        (call) => call[0] === "connection"
      )[1];
      connectionHandler(mockSocket);

      const joinRoomHandler = mockSocket.on.mock.calls.find(
        (call) => call[0] === "join-room"
      )[1];

      joinRoomHandler("room-123");

      expect(mockSocket.join).toHaveBeenCalledWith("room-123");
    });

    it("should handle leave-room event", () => {
      const manager = SocketManager.getInstance();

      manager.initialize(mockHttpServer as HttpServer);

      const connectionHandler = mockIO.on.mock.calls.find(
        (call) => call[0] === "connection"
      )[1];
      connectionHandler(mockSocket);

      const leaveRoomHandler = mockSocket.on.mock.calls.find(
        (call) => call[0] === "leave-room"
      )[1];

      leaveRoomHandler("room-123");

      expect(mockSocket.leave).toHaveBeenCalledWith("room-123");
    });

    it("should handle disconnect event", () => {
      const manager = SocketManager.getInstance();

      manager.initialize(mockHttpServer as HttpServer);

      const connectionHandler = mockIO.on.mock.calls.find(
        (call) => call[0] === "connection"
      )[1];
      connectionHandler(mockSocket);

      const disconnectHandler = mockSocket.on.mock.calls.find(
        (call) => call[0] === "disconnect"
      )[1];

      disconnectHandler();

      // Should not throw error
      expect(true).toBe(true);
    });
  });

  describe("multiple instances", () => {
    it("should maintain singleton behavior across multiple calls", () => {
      const manager1 = SocketManager.getInstance();
      const manager2 = SocketManager.getInstance();

      expect(manager1).toBe(manager2);

      manager1.initialize(mockHttpServer as HttpServer);

      const io1 = manager1.getIO();
      const io2 = manager2.getIO();

      expect(io1).toBe(io2);
    });
  });

  describe("error handling", () => {
    it("should handle initialization errors gracefully", () => {
      const manager = SocketManager.getInstance();

      // Mock Server constructor to throw error
      vi.mocked(Server).mockImplementation(() => {
        throw new Error("Socket.IO initialization failed");
      });

      expect(() => manager.initialize(mockHttpServer as HttpServer)).toThrow(
        "Socket.IO initialization failed"
      );
    });

    it("should handle event handler setup errors", () => {
      const manager = SocketManager.getInstance();

      // Mock IO.on to throw error
      mockIO.on.mockImplementation(() => {
        throw new Error("Event handler setup failed");
      });

      expect(() => manager.initialize(mockHttpServer as HttpServer)).toThrow(
        "Event handler setup failed"
      );
    });
  });

  describe("configuration", () => {
    it("should use correct CORS configuration", () => {
      const manager = SocketManager.getInstance();

      manager.initialize(mockHttpServer as HttpServer);

      expect(Server).toHaveBeenCalledWith(mockHttpServer, {
        cors: {
          origin: "http://localhost:3000",
          credentials: true,
        },
        transports: ["websocket", "polling"],
      });
    });

    it("should use correct transport configuration", () => {
      const manager = SocketManager.getInstance();

      manager.initialize(mockHttpServer as HttpServer);

      expect(Server).toHaveBeenCalledWith(mockHttpServer, {
        cors: {
          origin: "http://localhost:3000",
          credentials: true,
        },
        transports: ["websocket", "polling"],
      });
    });
  });

  describe("room management", () => {
    it("should handle multiple room joins", () => {
      const manager = SocketManager.getInstance();

      manager.initialize(mockHttpServer as HttpServer);

      const connectionHandler = mockIO.on.mock.calls.find(
        (call) => call[0] === "connection"
      )[1];
      connectionHandler(mockSocket);

      const joinRoomHandler = mockSocket.on.mock.calls.find(
        (call) => call[0] === "join-room"
      )[1];

      joinRoomHandler("room-1");
      joinRoomHandler("room-2");
      joinRoomHandler("room-3");

      expect(mockSocket.join).toHaveBeenCalledTimes(3);
      expect(mockSocket.join).toHaveBeenCalledWith("room-1");
      expect(mockSocket.join).toHaveBeenCalledWith("room-2");
      expect(mockSocket.join).toHaveBeenCalledWith("room-3");
    });

    it("should handle multiple room leaves", () => {
      const manager = SocketManager.getInstance();

      manager.initialize(mockHttpServer as HttpServer);

      const connectionHandler = mockIO.on.mock.calls.find(
        (call) => call[0] === "connection"
      )[1];
      connectionHandler(mockSocket);

      const leaveRoomHandler = mockSocket.on.mock.calls.find(
        (call) => call[0] === "leave-room"
      )[1];

      leaveRoomHandler("room-1");
      leaveRoomHandler("room-2");
      leaveRoomHandler("room-3");

      expect(mockSocket.leave).toHaveBeenCalledTimes(3);
      expect(mockSocket.leave).toHaveBeenCalledWith("room-1");
      expect(mockSocket.leave).toHaveBeenCalledWith("room-2");
      expect(mockSocket.leave).toHaveBeenCalledWith("room-3");
    });
  });

  describe("concurrent access", () => {
    it("should handle concurrent initialization calls", () => {
      const manager = SocketManager.getInstance();

      // Simulate concurrent initialization
      const result1 = manager.initialize(mockHttpServer as HttpServer);
      const result2 = manager.initialize(mockHttpServer as HttpServer);

      expect(result1).toBe(result2);
      expect(Server).toHaveBeenCalledTimes(1); // Should only be called once
    });

    it("should handle concurrent getIO calls", () => {
      const manager = SocketManager.getInstance();

      manager.initialize(mockHttpServer as HttpServer);

      const io1 = manager.getIO();
      const io2 = manager.getIO();

      expect(io1).toBe(io2);
    });
  });
});
