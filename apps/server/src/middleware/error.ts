import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { AppError } from "@/types";
import logger from "@/utils/logger";

// 自定义错误类
export class CustomError extends Error implements AppError {
  statusCode: number;
  isOperational: boolean;
  code?: string;

  constructor(message: string, statusCode: number, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    if (code !== undefined) {
      this.code = code;
    }

    Error.captureStackTrace(this, this.constructor);
  }
}

// 创建不同类型的错误
export const createError = {
  badRequest: (message: string, code?: string) =>
    new CustomError(message, 400, code),

  unauthorized: (message: string = "未授权访问", code?: string) =>
    new CustomError(message, 401, code),

  forbidden: (message: string = "禁止访问", code?: string) =>
    new CustomError(message, 403, code),

  notFound: (message: string = "资源未找到", code?: string) =>
    new CustomError(message, 404, code),

  conflict: (message: string, code?: string) =>
    new CustomError(message, 409, code),

  tooManyRequests: (message: string = "请求过于频繁", code?: string) =>
    new CustomError(message, 429, code),

  internalServer: (message: string = "服务器内部错误", code?: string) =>
    new CustomError(message, 500, code),

  serviceUnavailable: (message: string = "服务不可用", code?: string) =>
    new CustomError(message, 503, code),
};

// 全局错误处理中间件
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let error = { ...err };
  error.message = err.message;

  // 记录错误日志
  logger.error(`错误: ${err.message}`);
  logger.error(`堆栈: ${err.stack}`);
  logger.error(`请求URL: ${req.originalUrl}`);
  logger.error(`请求方法: ${req.method}`);
  logger.error(`请求IP: ${req.ip}`);

  // Prisma错误处理
  if (err.name === "PrismaClientKnownRequestError") {
    const prismaError = err as any;

    switch (prismaError.code) {
      case "P2002":
        error = createError.conflict("数据已存在", "DUPLICATE_ENTRY");
        break;
      case "P2025":
        error = createError.notFound("记录未找到", "RECORD_NOT_FOUND");
        break;
      case "P2003":
        error = createError.badRequest(
          "外键约束失败",
          "FOREIGN_KEY_CONSTRAINT"
        );
        break;
      default:
        error = createError.internalServer("数据库操作失败", "DATABASE_ERROR");
    }
  }

  // JWT错误处理
  if (err.name === "JsonWebTokenError") {
    error = createError.unauthorized("无效的令牌", "INVALID_TOKEN");
  }

  if (err.name === "TokenExpiredError") {
    error = createError.unauthorized("令牌已过期", "TOKEN_EXPIRED");
  }

  // 验证错误处理
  if (err.name === "ValidationError") {
    const validationError = err as any;
    const message = Object.values(validationError.errors)
      .map((val: any) => val.message)
      .join(", ");
    error = createError.badRequest(message, "VALIDATION_ERROR");
  }

  // 类型转换错误处理
  if (err.name === "CastError") {
    const castError = err as any;
    error = createError.badRequest(`无效的${castError.path}`, "CAST_ERROR");
  }

  // 重复键错误处理
  if ((err as any).code === 11000) {
    const duplicateError = err as any;
    const field = Object.keys(duplicateError.keyValue)[0];
    error = createError.conflict(`${field}已存在`, "DUPLICATE_FIELD");
  }

  // 默认错误状态码
  const statusCode = (error as AppError).statusCode || 500;
  const message = error.message || "服务器内部错误";

  // 开发环境返回详细错误信息
  const isDevelopment = process.env["NODE_ENV"] === "development";

  res.status(statusCode).json({
    success: false,
    message,
    error: isDevelopment ? err.stack : undefined,
    timestamp: new Date(),
  });
};

// 404错误处理
export const notFound = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const error = createError.notFound(`路径 ${req.originalUrl} 不存在`);
  next(error);
};

// 异步错误包装器
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// 验证错误处理
export const validationErrorHandler = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const result = validationResult(req);
  const errors = result.array();

  if (errors.length > 0) {
    const errorMessages = errors.map((error: any) => error.msg).join(", ");
    const error = createError.badRequest(errorMessages, "VALIDATION_ERROR");
    return next(error);
  }

  next();
};

// 文件上传错误处理
export const fileUploadErrorHandler = (
  err: Error,
  _req: Request,
  _res: Response,
  next: NextFunction
): void => {
  if (err.message.includes("LIMIT_FILE_SIZE")) {
    const error = createError.badRequest("文件大小超出限制", "FILE_TOO_LARGE");
    return next(error);
  }

  if (err.message.includes("LIMIT_FILE_COUNT")) {
    const error = createError.badRequest("文件数量超出限制", "TOO_MANY_FILES");
    return next(error);
  }

  if (err.message.includes("LIMIT_UNEXPECTED_FILE")) {
    const error = createError.badRequest(
      "不支持的文件类型",
      "INVALID_FILE_TYPE"
    );
    return next(error);
  }

  next(err);
};

// 速率限制错误处理
export const rateLimitErrorHandler = (
  _req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const error = createError.tooManyRequests(
    "请求过于频繁，请稍后再试",
    "RATE_LIMIT_EXCEEDED"
  );
  next(error);
};
