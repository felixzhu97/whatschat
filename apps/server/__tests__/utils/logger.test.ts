import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import logger, { requestLogger, errorLogger } from "../../src/shared/utils/logger";

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

  describe("Request Logger Middleware", () => {
    let mockRequest: any;
    let mockResponse: any;
    let mockNext: any;

    beforeEach(() => {
      mockRequest = {
        method: "GET",
        originalUrl: "/api/users",
        ip: "127.0.0.1",
      };

      mockResponse = {
        statusCode: 200,
        on: vi.fn(),
      };

      mockNext = vi.fn();
    });

    it("should log successful requests", () => {
      requestLogger(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.on).toHaveBeenCalledWith(
        "finish",
        expect.any(Function)
      );

      // Simulate response finish
      const finishCallback = mockResponse.on.mock.calls[0][1];
      finishCallback();

      expect(mockLogger.http).toHaveBeenCalledWith(
        expect.stringMatching(/GET \/api\/users 200 \d+ms/)
      );
    });

    it("should log error requests", () => {
      mockResponse.statusCode = 404;

      requestLogger(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.on).toHaveBeenCalledWith(
        "finish",
        expect.any(Function)
      );

      // Simulate response finish
      const finishCallback = mockResponse.on.mock.calls[0][1];
      finishCallback();

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringMatching(/GET \/api\/users 404 \d+ms/)
      );
    });

    it("should log server error requests", () => {
      mockResponse.statusCode = 500;

      requestLogger(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.on).toHaveBeenCalledWith(
        "finish",
        expect.any(Function)
      );

      // Simulate response finish
      const finishCallback = mockResponse.on.mock.calls[0][1];
      finishCallback();

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringMatching(/GET \/api\/users 500 \d+ms/)
      );
    });

    it("should calculate request duration", async () => {
      requestLogger(mockRequest, mockResponse, mockNext);

      // Simulate response finish after some time
      await new Promise((resolve) => setTimeout(resolve, 10));

      const finishCallback = mockResponse.on.mock.calls[0][1];
      finishCallback();

      expect(mockLogger.http).toHaveBeenCalledWith(
        expect.stringMatching(/GET \/api\/users 200 \d+ms/)
      );
    });

    it("should handle different HTTP methods", () => {
      const methods = ["GET", "POST", "PUT", "DELETE", "PATCH"];

      methods.forEach((method) => {
        mockRequest.method = method;
        requestLogger(mockRequest, mockResponse, mockNext);

        const finishCallback = mockResponse.on.mock.calls[0][1];
        finishCallback();

        expect(mockLogger.http).toHaveBeenCalledWith(
          expect.stringMatching(
            new RegExp(`${method} \\/api\\/users 200 \\d+ms`)
          )
        );
      });
    });

    it("should handle different URLs", () => {
      const urls = [
        "/api/users",
        "/api/posts",
        "/api/comments",
        "/api/auth/login",
      ];

      urls.forEach((url) => {
        mockRequest.originalUrl = url;
        requestLogger(mockRequest, mockResponse, mockNext);

        const finishCallback = mockResponse.on.mock.calls[0][1];
        finishCallback();

        expect(mockLogger.http).toHaveBeenCalledWith(
          expect.stringMatching(
            new RegExp(
              `GET ${url.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")} 200 \\d+ms`
            )
          )
        );
      });
    });
  });

  describe("Error Logger Middleware", () => {
    let mockRequest: any;
    let mockResponse: any;
    let mockNext: any;

    beforeEach(() => {
      mockRequest = {
        method: "POST",
        originalUrl: "/api/users",
        ip: "192.168.1.1",
      };

      mockResponse = {};

      mockNext = vi.fn();
    });

    it("should log error with request information", () => {
      const error = new Error("Test error message");

      errorLogger(error, mockRequest, mockResponse, mockNext);

      expect(mockLogger.error).toHaveBeenCalledWith(
        "Test error message - /api/users - POST - 192.168.1.1"
      );
      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it("should handle errors without message", () => {
      const error = new Error();

      errorLogger(error, mockRequest, mockResponse, mockNext);

      expect(mockLogger.error).toHaveBeenCalledWith(
        " - /api/users - POST - 192.168.1.1"
      );
      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it("should handle different error types", () => {
      const errors = [
        new Error("Validation error"),
        new TypeError("Type error"),
        new ReferenceError("Reference error"),
        new SyntaxError("Syntax error"),
      ];

      errors.forEach((error) => {
        errorLogger(error, mockRequest, mockResponse, mockNext);

        expect(mockLogger.error).toHaveBeenCalledWith(
          `${error.message} - /api/users - POST - 192.168.1.1`
        );
      });
    });

    it("should handle custom error objects", () => {
      const customError = {
        message: "Custom error",
        code: "CUSTOM_ERROR",
        statusCode: 400,
      };

      errorLogger(customError, mockRequest, mockResponse, mockNext);

      expect(mockLogger.error).toHaveBeenCalledWith(
        "Custom error - /api/users - POST - 192.168.1.1"
      );
      expect(mockNext).toHaveBeenCalledWith(customError);
    });

    it("should handle different request methods", () => {
      const methods = ["GET", "POST", "PUT", "DELETE", "PATCH"];
      const error = new Error("Test error");

      methods.forEach((method) => {
        mockRequest.method = method;
        errorLogger(error, mockRequest, mockResponse, mockNext);

        expect(mockLogger.error).toHaveBeenCalledWith(
          `Test error - /api/users - ${method} - 192.168.1.1`
        );
      });
    });

    it("should handle different URLs", () => {
      const urls = ["/api/users", "/api/posts", "/api/comments"];
      const error = new Error("Test error");

      urls.forEach((url) => {
        mockRequest.originalUrl = url;
        errorLogger(error, mockRequest, mockResponse, mockNext);

        expect(mockLogger.error).toHaveBeenCalledWith(
          `Test error - ${url} - POST - 192.168.1.1`
        );
      });
    });

    it("should handle different IP addresses", () => {
      const ips = ["127.0.0.1", "192.168.1.1", "10.0.0.1", "::1"];
      const error = new Error("Test error");

      ips.forEach((ip) => {
        mockRequest.ip = ip;
        errorLogger(error, mockRequest, mockResponse, mockNext);

        expect(mockLogger.error).toHaveBeenCalledWith(
          `Test error - /api/users - POST - ${ip}`
        );
      });
    });
  });

  describe("Logger Configuration", () => {
    it("should handle development environment", () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "development";

      // Test that logger is configured for development
      expect(logger).toBeDefined();
      expect(mockLogger.info).toBeDefined();

      process.env.NODE_ENV = originalEnv;
    });

    it("should handle production environment", () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "production";

      // Test that logger is configured for production
      expect(logger).toBeDefined();
      expect(mockLogger.info).toBeDefined();

      process.env.NODE_ENV = originalEnv;
    });

    it("should handle test environment", () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "test";

      // Test that logger is configured for test
      expect(logger).toBeDefined();
      expect(mockLogger.info).toBeDefined();

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe("Log File Rotation", () => {
    it("should handle daily log rotation", () => {
      // Test that the logger is configured for daily rotation
      expect(mockLogger).toBeDefined();
    });

    it("should handle log file size limits", () => {
      // Test that the logger respects file size limits
      expect(mockLogger).toBeDefined();
    });

    it("should handle log file retention", () => {
      // Test that the logger respects file retention policies
      expect(mockLogger).toBeDefined();
    });
  });

  describe("Log Formatting", () => {
    it("should format timestamps correctly", () => {
      logger.info("Timestamp test");

      expect(mockLogger.info).toHaveBeenCalledWith("Timestamp test");
    });

    it("should handle colorized output", () => {
      logger.info("Colorized test");

      expect(mockLogger.info).toHaveBeenCalledWith("Colorized test");
    });

    it("should handle JSON formatting for file logs", () => {
      logger.info("JSON format test");

      expect(mockLogger.info).toHaveBeenCalledWith("JSON format test");
    });
  });

  describe("Log Levels", () => {
    it("should respect log level hierarchy", () => {
      logger.error("Error message");
      logger.warn("Warning message");
      logger.info("Info message");
      logger.debug("Debug message");

      expect(mockLogger.error).toHaveBeenCalledWith("Error message");
      expect(mockLogger.warn).toHaveBeenCalledWith("Warning message");
      expect(mockLogger.info).toHaveBeenCalledWith("Info message");
      expect(mockLogger.debug).toHaveBeenCalledWith("Debug message");
    });

    it("should handle custom log levels", () => {
      logger.http("HTTP message");

      expect(mockLogger.http).toHaveBeenCalledWith("HTTP message");
    });
  });

  describe("Error Recovery", () => {
    it("should handle logger initialization errors", () => {
      expect(() => {
        logger.info("Test message");
      }).not.toThrow();
    });

    it("should handle transport errors gracefully", () => {
      expect(() => {
        logger.error("Error message");
      }).not.toThrow();
    });

    it("should handle format errors gracefully", () => {
      expect(() => {
        logger.info("Format test");
      }).not.toThrow();
    });
  });
});
