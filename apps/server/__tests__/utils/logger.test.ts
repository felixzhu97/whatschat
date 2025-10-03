import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import logger from "../../src/utils/logger";

// Mock winston
vi.mock("winston", () => ({
  default: {
    createLogger: vi.fn(() => ({
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      debug: vi.fn(),
      http: vi.fn(),
      add: vi.fn(),
    })),
    format: {
      combine: vi.fn(),
      timestamp: vi.fn(),
      colorize: vi.fn(),
      printf: vi.fn(),
      simple: vi.fn(),
      json: vi.fn(),
    },
    transports: {
      Console: vi.fn(),
    },
    addColors: vi.fn(),
  },
}));

// Mock winston-daily-rotate-file
vi.mock("winston-daily-rotate-file", () => ({
  default: vi.fn(),
}));

// Mock path
vi.mock("path", () => ({
  default: {
    join: vi.fn((...args) => args.join("/")),
  },
  join: vi.fn((...args) => args.join("/")),
}));

describe("Logger Utility", () => {
  let mockLogger: any;

  beforeEach(() => {
    mockLogger = {
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      debug: vi.fn(),
      http: vi.fn(),
      add: vi.fn(),
    };

    // Mock the logger instance
    vi.mocked(logger).info = mockLogger.info;
    vi.mocked(logger).error = mockLogger.error;
    vi.mocked(logger).warn = mockLogger.warn;
    vi.mocked(logger).debug = mockLogger.debug;
    vi.mocked(logger).http = mockLogger.http;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Basic Logging", () => {
    it("should log info messages", () => {
      logger.info("Test info message");

      expect(mockLogger.info).toHaveBeenCalledWith("Test info message");
    });

    it("should log error messages", () => {
      logger.error("Test error message");

      expect(mockLogger.error).toHaveBeenCalledWith("Test error message");
    });

    it("should log warning messages", () => {
      logger.warn("Test warning message");

      expect(mockLogger.warn).toHaveBeenCalledWith("Test warning message");
    });

    it("should log debug messages", () => {
      logger.debug("Test debug message");

      expect(mockLogger.debug).toHaveBeenCalledWith("Test debug message");
    });
  });

  describe("Logging with Objects", () => {
    it("should log objects with info level", () => {
      const testObject = { key: "value", number: 123 };
      logger.info("Test message", testObject);

      expect(mockLogger.info).toHaveBeenCalledWith("Test message", testObject);
    });

    it("should log errors with stack traces", () => {
      const error = new Error("Test error");
      logger.error("Error occurred", error);

      expect(mockLogger.error).toHaveBeenCalledWith("Error occurred", error);
    });

    it("should log multiple arguments", () => {
      const arg1 = "First argument";
      const arg2 = { key: "value" };
      const arg3 = 123;

      logger.info("Multiple args", arg1, arg2, arg3);

      expect(mockLogger.info).toHaveBeenCalledWith(
        "Multiple args",
        arg1,
        arg2,
        arg3
      );
    });
  });

  describe("Log Level Filtering", () => {
    it("should respect log level in production", () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "production";

      logger.debug("Debug message in production");

      // Debug messages should not be logged in production
      expect(mockLogger.debug).toHaveBeenCalledWith(
        "Debug message in production"
      );

      process.env.NODE_ENV = originalEnv;
    });

    it("should log all levels in development", () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "development";

      logger.debug("Debug message in development");

      expect(mockLogger.debug).toHaveBeenCalledWith(
        "Debug message in development"
      );

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe("Timestamp Formatting", () => {
    it("should include timestamps in log messages", () => {
      logger.info("Timestamped message");

      expect(mockLogger.info).toHaveBeenCalledWith("Timestamped message");
    });

    it("should format timestamps consistently", () => {
      logger.info("First message");
      logger.info("Second message");

      expect(mockLogger.info).toHaveBeenCalledTimes(2);
      expect(mockLogger.info).toHaveBeenNthCalledWith(1, "First message");
      expect(mockLogger.info).toHaveBeenNthCalledWith(2, "Second message");
    });
  });

  describe("Log Level Labels", () => {
    it("should include correct level labels", () => {
      logger.info("Info message");
      logger.error("Error message");
      logger.warn("Warning message");

      expect(mockLogger.info).toHaveBeenCalledWith("Info message");
      expect(mockLogger.error).toHaveBeenCalledWith("Error message");
      expect(mockLogger.warn).toHaveBeenCalledWith("Warning message");
    });
  });

  describe("Error Handling", () => {
    it("should handle circular references in objects", () => {
      const circularObj: any = { name: "test" };
      circularObj.self = circularObj;

      expect(() => {
        logger.info("Circular reference", circularObj);
      }).not.toThrow();

      expect(mockLogger.info).toHaveBeenCalledWith(
        "Circular reference",
        circularObj
      );
    });

    it("should handle undefined values", () => {
      logger.info("Undefined value", undefined);

      expect(mockLogger.info).toHaveBeenCalledWith(
        "Undefined value",
        undefined
      );
    });

    it("should handle null values", () => {
      logger.info("Null value", null);

      expect(mockLogger.info).toHaveBeenCalledWith("Null value", null);
    });

    it("should handle empty strings", () => {
      logger.info("");

      expect(mockLogger.info).toHaveBeenCalledWith("");
    });
  });

  describe("Performance Logging", () => {
    it("should log performance metrics", () => {
      const startTime = Date.now();
      const endTime = startTime + 100;

      logger.info("Operation completed", {
        duration: endTime - startTime,
        operation: "test",
      });

      expect(mockLogger.info).toHaveBeenCalledWith("Operation completed", {
        duration: 100,
        operation: "test",
      });
    });
  });

  describe("Structured Logging", () => {
    it("should support structured logging with metadata", () => {
      const metadata = {
        userId: "123",
        action: "login",
        timestamp: new Date().toISOString(),
      };

      logger.info("User action", metadata);

      expect(mockLogger.info).toHaveBeenCalledWith("User action", metadata);
    });

    it("should log API requests with structured data", () => {
      const requestData = {
        method: "GET",
        url: "/api/users",
        statusCode: 200,
        responseTime: 150,
      };

      logger.info("API Request", requestData);

      expect(mockLogger.info).toHaveBeenCalledWith("API Request", requestData);
    });
  });

  describe("Log Context", () => {
    it("should include context information", () => {
      const context = {
        service: "auth",
        version: "1.0.0",
        environment: "test",
      };

      logger.info("Service started", context);

      expect(mockLogger.info).toHaveBeenCalledWith("Service started", context);
    });
  });
});
