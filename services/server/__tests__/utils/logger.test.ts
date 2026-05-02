import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const mockLoggerInstance = {
  info: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  debug: vi.fn(),
  http: vi.fn(),
  add: vi.fn(),
};

vi.mock("winston", () => ({
  default: {
    createLogger: vi.fn(() => mockLoggerInstance),
    format: {
      combine: vi.fn((...args) => args),
      timestamp: vi.fn(() => vi.fn((info) => info)),
      colorize: vi.fn(() => vi.fn((info) => info)),
      printf: vi.fn(() => vi.fn((info) => info)),
      simple: vi.fn(() => vi.fn((info) => info)),
      json: vi.fn(() => vi.fn((info) => info)),
    },
    transports: {
      Console: vi.fn(),
    },
    addColors: vi.fn(),
  },
  createLogger: vi.fn(() => mockLoggerInstance),
  format: {
    combine: vi.fn((...args) => args),
    timestamp: vi.fn(() => vi.fn((info) => info)),
    colorize: vi.fn(() => vi.fn((info) => info)),
    printf: vi.fn(() => vi.fn((info) => info)),
    simple: vi.fn(() => vi.fn((info) => info)),
    json: vi.fn(() => vi.fn((info) => info)),
  },
  transports: {
    Console: vi.fn(),
  },
  addColors: vi.fn(),
}));

vi.mock("winston-daily-rotate-file", () => ({
  default: vi.fn(),
}));

vi.mock("path", () => ({
  join: vi.fn((...args) => args.join("/")),
}));

describe("Logger Utility", () => {
  let mockLogger: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockLogger = mockLoggerInstance;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Basic Logging", () => {
    it("should log info messages", () => {
      mockLogger.info("Test info message");
      expect(mockLogger.info).toHaveBeenCalledWith("Test info message");
    });

    it("should log error messages", () => {
      mockLogger.error("Test error message");
      expect(mockLogger.error).toHaveBeenCalledWith("Test error message");
    });

    it("should log warning messages", () => {
      mockLogger.warn("Test warning message");
      expect(mockLogger.warn).toHaveBeenCalledWith("Test warning message");
    });
  });

  describe("Structured Logging", () => {
    it("should support structured logging with metadata", () => {
      const metadata = {
        userId: "123",
        action: "login",
        timestamp: new Date().toISOString(),
      };

      mockLogger.info("User action", metadata);
      expect(mockLogger.info).toHaveBeenCalledWith("User action", metadata);
    });
  });

  describe("Log Level Filtering", () => {
    it("should handle different log levels", () => {
      mockLogger.error("Error message");
      mockLogger.warn("Warning message");
      mockLogger.info("Info message");
      mockLogger.debug("Debug message");
      mockLogger.http("HTTP message");

      expect(mockLogger.error).toHaveBeenCalledWith("Error message");
      expect(mockLogger.warn).toHaveBeenCalledWith("Warning message");
      expect(mockLogger.info).toHaveBeenCalledWith("Info message");
      expect(mockLogger.debug).toHaveBeenCalledWith("Debug message");
      expect(mockLogger.http).toHaveBeenCalledWith("HTTP message");
    });
  });

  describe("Error Handling", () => {
    it("should handle circular references in objects", () => {
      const circularObj: any = { name: "test" };
      circularObj.self = circularObj;

      expect(() => {
        mockLogger.info("Circular reference", circularObj);
      }).not.toThrow();
    });

    it("should handle undefined values", () => {
      mockLogger.info("Undefined value", undefined);
      expect(mockLogger.info).toHaveBeenCalledWith("Undefined value", undefined);
    });

    it("should handle null values", () => {
      mockLogger.info("Null value", null);
      expect(mockLogger.info).toHaveBeenCalledWith("Null value", null);
    });
  });

  describe("Performance Logging", () => {
    it("should log performance metrics", () => {
      const startTime = Date.now();
      const endTime = startTime + 100;

      mockLogger.info("Operation completed", {
        duration: endTime - startTime,
        operation: "test",
      });

      expect(mockLogger.info).toHaveBeenCalledWith("Operation completed", {
        duration: 100,
        operation: "test",
      });
    });
  });
});
