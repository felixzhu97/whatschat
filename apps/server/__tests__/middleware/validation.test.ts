import { describe, it, expect, vi, beforeEach } from "vitest";
import { Request, Response, NextFunction } from "express";
import { validate } from "../../src/middleware/validation";
import { body, param, query } from "express-validator";

describe("Validation Middleware", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      body: {},
      params: {},
      query: {},
    };
    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    mockNext = vi.fn();
  });

  describe("validate", () => {
    it("should pass validation for valid data", async () => {
      const validations = [
        body("email").isEmail().withMessage("Invalid email format"),
        body("password")
          .isLength({ min: 6 })
          .withMessage("Password must be at least 6 characters"),
      ];

      mockRequest.body = {
        email: "test@example.com",
        password: "password123",
      };

      await validate(validations)(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it("should fail validation for missing required fields", async () => {
      const validations = [
        body("email").isEmail().withMessage("Invalid email format"),
        body("password")
          .isLength({ min: 6 })
          .withMessage("Password must be at least 6 characters"),
      ];

      mockRequest.body = {
        email: "test@example.com",
        // password is missing
      };

      await validate(validations)(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "输入验证失败",
        errors: expect.arrayContaining([
          expect.objectContaining({
            field: "password",
            message: "Password must be at least 6 characters",
          }),
        ]),
        timestamp: expect.any(String),
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should fail validation for invalid email format", async () => {
      const validations = [
        body("email").isEmail().withMessage("Invalid email format"),
        body("password")
          .isLength({ min: 6 })
          .withMessage("Password must be at least 6 characters"),
      ];

      mockRequest.body = {
        email: "invalid-email",
        password: "password123",
      };

      await validate(validations)(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "输入验证失败",
        errors: expect.arrayContaining([
          expect.objectContaining({
            field: "email",
            message: "Invalid email format",
          }),
        ]),
        timestamp: expect.any(String),
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should fail validation for password too short", async () => {
      const validations = [
        body("email").isEmail().withMessage("Invalid email format"),
        body("password")
          .isLength({ min: 6 })
          .withMessage("Password must be at least 6 characters"),
      ];

      mockRequest.body = {
        email: "test@example.com",
        password: "123",
      };

      await validate(validations)(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "输入验证失败",
        errors: expect.arrayContaining([
          expect.objectContaining({
            field: "password",
            message: "Password must be at least 6 characters",
          }),
        ]),
        timestamp: expect.any(String),
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should validate query parameters", async () => {
      const validations = [
        query("page")
          .isInt({ min: 1 })
          .withMessage("Page must be a positive integer"),
        query("limit")
          .isInt({ min: 1, max: 100 })
          .withMessage("Limit must be between 1 and 100"),
      ];

      mockRequest.query = {
        page: "1",
        limit: "10",
      };

      await validate(validations)(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it("should validate URL parameters", async () => {
      const validations = [
        param("id").isUUID().withMessage("ID must be a valid UUID"),
      ];

      mockRequest.params = {
        id: "123e4567-e89b-12d3-a456-426614174000",
      };

      await validate(validations)(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it("should fail validation for invalid URL parameters", async () => {
      const validations = [
        param("id").isUUID().withMessage("ID must be a valid UUID"),
      ];

      mockRequest.params = {
        id: "invalid-uuid",
      };

      await validate(validations)(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "输入验证失败",
        errors: expect.arrayContaining([
          expect.objectContaining({
            field: "id",
            message: "ID must be a valid UUID",
          }),
        ]),
        timestamp: expect.any(String),
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should handle multiple validation errors", async () => {
      const validations = [
        body("email").isEmail().withMessage("Invalid email format"),
        body("password")
          .isLength({ min: 6 })
          .withMessage("Password must be at least 6 characters"),
        body("age").isInt({ min: 18 }).withMessage("Age must be at least 18"),
      ];

      mockRequest.body = {
        email: "invalid-email",
        password: "123",
        age: "15",
      };

      await validate(validations)(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "输入验证失败",
        errors: expect.arrayContaining([
          expect.objectContaining({
            field: "email",
            message: "Invalid email format",
          }),
          expect.objectContaining({
            field: "password",
            message: "Password must be at least 6 characters",
          }),
          expect.objectContaining({
            field: "age",
            message: "Age must be at least 18",
          }),
        ]),
        timestamp: expect.any(String),
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should handle empty validation array", async () => {
      const validations: any[] = [];

      await validate(validations)(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it("should handle nested object validation", async () => {
      const validations = [
        body("user.name").notEmpty().withMessage("Name is required"),
        body("user.email").isEmail().withMessage("Invalid email format"),
      ];

      mockRequest.body = {
        user: {
          name: "John Doe",
          email: "john@example.com",
        },
      };

      await validate(validations)(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it("should fail nested object validation", async () => {
      const validations = [
        body("user.name").notEmpty().withMessage("Name is required"),
        body("user.email").isEmail().withMessage("Invalid email format"),
      ];

      mockRequest.body = {
        user: {
          name: "",
          email: "invalid-email",
        },
      };

      await validate(validations)(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "输入验证失败",
        errors: expect.arrayContaining([
          expect.objectContaining({
            field: "user.name",
            message: "Name is required",
          }),
          expect.objectContaining({
            field: "user.email",
            message: "Invalid email format",
          }),
        ]),
        timestamp: expect.any(String),
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});
